import { exposeThemeContext } from "./theme/theme-context";
import { exposeWindowContext } from "./window/window-context";
import { exposePythonContext } from "./python/python-context";

export default function exposeContexts() {
  exposeWindowContext();
  exposeThemeContext();
  exposePythonContext();
}
