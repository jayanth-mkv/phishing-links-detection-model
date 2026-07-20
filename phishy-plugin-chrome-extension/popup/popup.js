(() => {
  // Receive the links from content.js
  // Get the current tab URL
  // console.log("Inside popup.js")
  
  // Get a reference to the form element
  const form = document.getElementById("report_form");
  
  if (form) {
    
    // Add an event listener to the form's submit event
    form.addEventListener("submit", function (event) {
      // Prevent the default form submission behavior
      event.preventDefault();
      
      const s = document.getElementById("spin");
      s.classList.remove("d-none");
        // Get the form data
        const url = document.getElementById("exampleFormControlTextarea1").value;
        const label = document.querySelector(".form-select").value;
        document.getElementById("exampleFormControlTextarea1").value = "";
        // document.querySelector(".form-select").value="";
          // Feedback writes require a trusted server-side API key and are not
          // submitted from the public extension.
        if (url.length < 5) {
        const te = document.getElementById("toast_e");
          te.classList.add("show");
          const s = document.getElementById("spin");
          s.classList.add("d-none");
        } else {
          const te = document.getElementById("toast_e");
          te.classList.add("show");
          s.classList.add("d-none");
        }
      });
        
      const ts = document.getElementById("toast_s");
      const te = document.getElementById("toast_e");
      const tsb = document.getElementById("toast_sb");
      const teb = document.getElementById("toast_eb");
      tsb.addEventListener("click", (event) => {
        ts.classList.remove("show");
      });
      teb.addEventListener("click", (event) => {
        te.classList.remove("show");
      });
  
      function validateURL() {
        var inputURL = document.getElementById(
          "exampleFormControlTextarea1"
        ).value;
        var urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        var isValidURL = urlRegex.test(inputURL);
        if (!isValidURL) {
          document
            .getElementById("exampleFormControlTextarea1")
            .setCustomValidity("Please enter a valid URL");
        } else {
          document
            .getElementById("exampleFormControlTextarea1")
            .setCustomValidity("");
        }
      }

      const tb = document.getElementById("exampleFormControlTextarea1");
      tb.addEventListener("input", validateURL);
    
  }
  else {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentTabUrl = tabs[0].url;

        // Retrieve data from chrome.storage.sync
        chrome.storage.session.get(currentTabUrl, function (result) {
          // console.log(result);
          if (result[currentTabUrl]) {
            const percent =
              Math.round(
                (result[currentTabUrl]["safe"] * 100 + Number.EPSILON) * 100
              ) / 100;
            const matter = document.getElementById("matter");
            const per = document.getElementById("percent");
            const glow = document.getElementById("glow");
            // const symbol = document.getElementById("symbol");
            // const load = document.getElementById("load");
            // const sym_text = symbol.children[0];
            setTimeout(function () {
              per.innerText = percent;
              glow.classList.remove("placeholder");
              matter.style.color = "white";
              if (percent > 50) {
                matter.classList.add("bg-success");
                // sym_text.innerText = "Safe to Go";
              } else if (percent <= 50 && percent >= 10) {
                matter.classList.add("bg-warning");
                // sym_text.innerText = "Be Careful";
              } else {
                matter.classList.add("bg-danger");
                // sym_text.innerText = "Phishy";
              }

              // symbol.classList.remove("d-none");
              // load.classList.add("d-none");
            }, 500);
          }
          // Do something with the retrieved data
        });
      });
  
  }
    



      // function myFunction() {
  //   var x = document.getElementById("myDIV");
  //   if (x.style.display === "none") {
  //     x.style.display = "block";
  //   } else {
  //     x.style.display = "none";
  //   }
  // }

  // const report_btn = document.getElementById("report_btn");
  // report_btn.addEventListener("click", myFunction);

  // console.log("Outside popup onmessage");
  // chrome.runtime.onMessage.addListener(function (
  //   message,
  //   sender,
  //   sendResponse
  // ) {
  //   console.log("Inside popup onmessage");
  //   if (message.type === "urls") {
  //     // Get the links from the message
  //     const links = message.urls;
  //     console.log(links);
  //     // Display the links in the popup
  //     const linkList = document.getElementById("linkList");
  //     if (links.length > 0 && links.length <= 5) {
  //       for (let i = 0; i < links.length; i++) {
  //         const link = links[i];
  //         const listItem = document.createElement("li");
  //         listItem.textContent = link;
  //         linkList.appendChild(listItem);
  //       }
  //     } else {
  //       const warningMessage = document.createElement("p");
  //       warningMessage.textContent = "Be careful!";
  //       linkList.appendChild(warningMessage);
  //     }
  //   }
  //   sendResponse({"message":"Hello"})
  // });
})();
