(() => {
  
  const geturls = () => {
    
    // Get all the links on the current page
    const links = document.getElementsByTagName("a");
  
    // Loop through all the links and extract their URLs
    let urls = [];
    for (let i = 0; i < links.length; i++) {
      const url = links[i].href;
      urls.push(url);
    }
  
    // Print out the URLs to the console
    if (urls.length > 5) {
      urls = urls.slice(0, 5);
    }
    
    chrome.runtime.sendMessage(
      {
        type: "urls",
        urls: urls,
      },
      function (response) {
      }
    );
    
  }

  // geturls();



  // const addDiv = ({percent,message}) => {
  //   var container = document.createElement("div");
  //   container.style.position = "fixed";
  //   container.style.height = "50px";
  //   container.style.width = " 50px";
  //   container.style.top = "5px";
  //   container.style.right = "5px";
  //   container.style.zIndex = "10000";
  //   container.style.border = "1px solid black";
  //   container.style.borderRadius = "50%";
  //   if (percent < 0.5) {
  //     container.style.backgroundColor = "Red";
  //     container.style.color = "white";
      
  //   } else {
      
  //     container.style.backgroundColor = "Green";
  //     container.style.color = "white";
  //   }
  //   container.innerHTML = percent*100+"% Safe";
  //   document.body.appendChild(container);
  // }
  
  const createToast = ({ percent, message }) => {
  // create toast container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '20px';
  container.style.right = '20px';
  container.style.minWidth = '300px';
  container.style.maxWidth = '500px';
  container.style.padding = '16px';
  if (percent < 0.5) {
      container.style.backgroundColor = "#f0ad4e";
      container.style.color = "white";
      
    } else {
      
      container.style.backgroundColor = "#5cb85c";
      container.style.color = "white";
    }
  container.style.boxShadow = '0px 8px 16px rgba(0, 0, 0, 0.1)';
  container.style.borderRadius = '8px';
  container.style.zIndex = '99999';
  container.style.fontWeight = '600';
  container.style.fontSize = '16px';

  // create toast header
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';

  // create toast message
  const messageEl = document.createElement('div');
  messageEl.textContent = message;
  messageEl.style.marginBottom = '8px';
    
  const messageFoot = document.createElement('div');
  messageFoot.textContent = "Team Phishly";
  messageFoot.style.margin = '8px';
    messageFoot.style.textAlign = "right";

    const percentageEl = document.createElement('div');
    if (percent < 0.5) { 

    }
    else {
      
      // create toast percentage
      percentageEl.textContent = `${(percent * 100).toFixed()}% Safe`;
    }

  // create toast close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'X';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.color = '#000';
  closeButton.style.fontSize = '15px';
  closeButton.style.cursor = 'pointer';

  // attach close button click event
  closeButton.addEventListener('click', () => {
    container.remove();
  });

    if (percent >= 0.5) {
      // append elements to the container
      header.appendChild(percentageEl);
    }
  header.appendChild(closeButton);
  container.appendChild(header);
  container.appendChild(messageEl);
  container.appendChild(messageFoot);

  // append container to the body
    document.body.appendChild(container);
    
    setTimeout(() => {
      closeButton.click();
    },4000)

};


  chrome.runtime.onMessage.addListener(function (
    message,
    sender,
    sendResponse
  ) {
    if (message.type === "showSafeMessage") {
      
      // addDiv(message)
      createToast(message)


      // chrome.runtime.sendMessage({
      //   type: "showNotification",
      //   message: JSON.stringify(message),
      // });
    }
    if (message.type === "showErrorMessage") {
      
      // addDiv(message);
      createToast(message);

    }
    sendResponse({ "message": "From Content Script" });
  });





})();
