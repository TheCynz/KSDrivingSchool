"use strict";
(function () {
    window.tailwind = window.tailwind || {};
    window.tailwind.config = {
        theme: {
            extend: {
                colors: {
                    ink: "#17211d",
                    road: "#0b3a78",
                    signal: "#f6c445",
                    kerb: "#eef5fb",
                    leaf: "#1769aa"
                },
                fontFamily: {
                    sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
                },
                boxShadow: {
                    panel: "0 18px 45px rgb(23 33 29 / 8%)",
                    lift: "0 18px 45px rgb(23 33 29 / 12%)"
                }
            }
        }
    };
})();
