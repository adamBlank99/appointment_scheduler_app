import { useEffect, useRef, useState } from "react"

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script"
const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

let turnstileScriptPromise

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (turnstileScriptPromise) return turnstileScriptPromise

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID)
    const script = existingScript || document.createElement("script")

    function handleLoad() {
      if (window.turnstile) resolve(window.turnstile)
      else reject(new Error("Turnstile loaded without exposing its API."))
    }

    script.addEventListener("load", handleLoad, { once: true })
    script.addEventListener("error", () => reject(new Error("Turnstile failed to load.")), { once: true })

    if (!existingScript) {
      script.id = TURNSTILE_SCRIPT_ID
      script.src = TURNSTILE_SCRIPT_URL
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  })

  return turnstileScriptPromise
}

function TurnstileWidget({ siteKey, action, onVerify, onExpire, resetSignal = 0 }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const onVerifyRef = useRef(onVerify)
  const onExpireRef = useRef(onExpire)
  const [widgetError, setWidgetError] = useState("")

  useEffect(() => { onVerifyRef.current = onVerify }, [onVerify])
  useEffect(() => { onExpireRef.current = onExpire }, [onExpire])

  useEffect(() => {
    if (!siteKey || !containerRef.current) return undefined

    let cancelled = false

    loadTurnstile().then((turnstile) => {
      if (cancelled || !containerRef.current) return

      setWidgetError("")
      widgetIdRef.current = turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action,
        callback: (token) => {
          setWidgetError("")
          onVerifyRef.current(token)
        },
        "expired-callback": () => onExpireRef.current(),
        "error-callback": () => {
          setWidgetError("Bot protection could not verify this hostname. Check the Turnstile widget settings and reload the page.")
          onExpireRef.current()
        },
        theme: "light",
      })
    }).catch(() => {
      if (cancelled) return
      setWidgetError("Bot protection could not load. Check your connection and reload the page.")
      onExpireRef.current()
    })

    return () => {
      cancelled = true
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [siteKey, action])

  useEffect(() => {
    if (resetSignal > 0 && widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
    }
  }, [resetSignal])

  return (
    <div className="turnstile-field">
      <div className="turnstile-container" ref={containerRef} aria-label="Bot protection challenge" />
      {widgetError && <p className="turnstile-error" role="alert">{widgetError}</p>}
    </div>
  )
}

export default TurnstileWidget
