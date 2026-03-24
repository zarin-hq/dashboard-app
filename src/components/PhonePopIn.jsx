import { useEffect, useRef, useState } from "react";

export default function PhonePopIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <img
        src="/assets/village-iphone-02.png"
        alt="App screen 2"
        className="absolute w-[570px] drop-shadow-2xl"
        style={{
          transform: visible
            ? "translate(-150px, 0px) scale(1)"
            : "translate(-150px, 40px) scale(0.85)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease",
          zIndex: 1,
        }}
      />
      <img
        src="/assets/village-iphone-01.png"
        alt="App screen 1"
        className="absolute w-[570px] drop-shadow-2xl"
        style={{
          transform: visible
            ? "translate(150px, -10px) scale(1)"
            : "translate(150px, 30px) scale(0.85)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s, opacity 0.4s ease 0.15s",
          zIndex: 2,
        }}
      />
    </div>
  );
}
