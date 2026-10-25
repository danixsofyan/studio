/* Flat-sticker helpers shared by every scene. Seek-safe: all motion lives on
   the scene's paused timeline. */
(function () {
  if (window.pop) return;
  var pop = {};

  /* [data-pop="t"]   lands at t with a springy scale-in (back.out)
     [data-rot="-8"]  starting tilt for that landing (default -6)
     [data-keep]      stays to the end; everything else shrinks out just
                      before the scene ends so the next scene starts clean
     [data-out="t"]   shrinks out at t instead
     [data-wipe="t"]  text revealed left to right at t
     [data-draw="t"]  path drawn on at t over data-dur seconds */
  pop.scene = function (tl, root, duration) {
    var out = duration - 0.3;
    root.querySelectorAll("[data-pop]").forEach(function (el) {
      var at = parseFloat(el.getAttribute("data-pop"));
      var rot = parseFloat(el.getAttribute("data-rot") || "-6");
      tl.fromTo(
        el,
        { scale: 0, opacity: 0, rotation: rot, transformOrigin: "50% 60%" },
        { scale: 1, opacity: 1, rotation: 0, duration: 0.45, ease: "back.out(1.8)" },
        at,
      );
      if (!el.hasAttribute("data-keep")) {
        var leave = el.hasAttribute("data-out") ? parseFloat(el.getAttribute("data-out")) : out;
        tl.to(el, { scale: 0.4, opacity: 0, duration: 0.25, ease: "power2.in" }, leave);
      }
    });
    root.querySelectorAll("[data-wipe]").forEach(function (el) {
      var at = parseFloat(el.getAttribute("data-wipe"));
      tl.fromTo(
        el,
        { clipPath: "inset(-20% 100% -20% -2%)" },
        { clipPath: "inset(-20% -2% -20% -2%)", duration: 0.35, ease: "power2.out" },
        at,
      );
      if (!el.hasAttribute("data-keep")) {
        tl.to(el, { opacity: 0, duration: 0.2 }, out);
      }
    });
    root.querySelectorAll("[data-draw]").forEach(function (p) {
      var at = parseFloat(p.getAttribute("data-draw"));
      var dur = parseFloat(p.getAttribute("data-dur") || "0.5");
      var len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len + " " + len, strokeDashoffset: len });
      tl.to(p, { strokeDashoffset: 0, duration: dur, ease: "power1.inOut" }, at);
      if (!p.hasAttribute("data-keep")) {
        tl.to(p, { opacity: 0, duration: 0.2 }, out);
      }
    });
  };

  window.pop = pop;
})();
