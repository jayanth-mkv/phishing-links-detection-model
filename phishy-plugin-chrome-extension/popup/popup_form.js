import getPercentage from "../scripts/utils.js";

const form = document.getElementById("report_form");
const input = document.getElementById("exampleFormControlTextarea1");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = input.value.trim();
  try {
    new URL(url);
  } catch {
    input.setCustomValidity("Enter a complete HTTP or HTTPS URL");
    input.reportValidity();
    return;
  }
  input.setCustomValidity("");

  const percentage = await getPercentage(url);
  const errorToast = document.getElementById("toast_e");
  if (percentage < 0) {
    errorToast?.classList.add("show");
    return;
  }

  document.getElementById("result")?.classList.remove("d-none");
  document.getElementById("symbol_list")?.classList.remove("d-none");
  document.getElementById("glow")?.classList.remove("placeholder");
  document.getElementById("load")?.classList.add("d-none");
  const percent = document.getElementById("percent");
  if (percent) percent.innerText = (percentage * 100).toFixed(2);
  const symbol = document.getElementById("symbol");
  symbol?.classList.remove("d-none");
  if (symbol?.children[0]) {
    symbol.children[0].innerText =
      percentage > 0.6 ? "Lower risk" : percentage > 0.2 ? "Use caution" : "Phishing indicators";
  }
});

document.getElementById("reset")?.addEventListener("click", () => form?.reset());
