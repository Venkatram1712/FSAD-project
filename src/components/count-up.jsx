import { jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
function CountUp({
  end,
  duration = 900,
  className,
  prefix = "",
  suffix = "",
  decimals = 0
}) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setValue(end);
      return;
    }
    const startValue = 0;
    const startTime = performance.now();
    const tick = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const nextValue = startValue + (end - startValue) * progress;
      setValue(nextValue);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    setValue(0);
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration]);
  const formattedValue = new Intl.NumberFormat(void 0, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
  return /* @__PURE__ */ jsx("span", { className, children: `${prefix}${formattedValue}${suffix}` });
}
export {
  CountUp
};
