module.exports = {
  plugins: [
    require("tailwindcss")(),
    require("autoprefixer")(),
    {
      postcssPlugin: "scope-once-ui-pilot",
      OnceExit(root) {
        root.walkRules((rule) => {
          // Once UI and Tailwind both define utilities such as px-4.
          // Scope only Once UI's global stylesheet; leave its CSS modules intact.
          const source = rule.source?.input.file ?? "";
          if (!source.endsWith("/@once-ui-system/core/dist/css/styles.css"))
            return;
          if (
            rule.parent?.type === "atrule" &&
            /keyframes$/.test(rule.parent.name)
          )
            return;
          rule.selectors = rule.selectors.flatMap((selector) => [
            `:where(.once-ui):is(${selector})`,
            `:where(.once-ui) ${selector}`,
          ]);
        });
      },
    },
  ],
};
