var initStripe = function() {
  "use strict";

  var stripe = Stripe("pk_test_51H2NVjDbnlrOGXHibgFUU9qHGcZuds4QQvrAFCYCX9wAW2FwA3TLD7z0eUbfhEqpqbjcrCeOVoHjSkRsy1jsvuYz00LI5DuEOq")

  function registerElements(elements, exampleName) {
    var formClass = '.' + exampleName;
    var example = document.querySelector(formClass);
  
    var form = example.querySelector('form');
    var resetButton = example.querySelector('a.reset');
    var error = form.querySelector('.error');
    var errorMessage = error.querySelector('.message');
  
    function enableInputs() {
      Array.prototype.forEach.call(
        form.querySelectorAll(
          "input[type='text'], input[type='email'], input[type='tel']"
        ),
        function(input) {
          input.removeAttribute('disabled');
        }
      );
    }
  
    function disableInputs() {
      Array.prototype.forEach.call(
        form.querySelectorAll(
          "input[type='text'], input[type='email'], input[type='tel']"
        ),
        function(input) {
          input.setAttribute('disabled', 'true');
        }
      );
    }
  
    function triggerBrowserValidation() {
      // The only way to trigger HTML5 form validation UI is to fake a user submit
      // event.
      var submit = document.createElement('input');
      submit.type = 'submit';
      submit.style.display = 'none';
      form.appendChild(submit);
      submit.click();
      submit.remove();
    }
  
    // Listen for errors from each Element, and show error messages in the UI.
    var savedErrors = {};
    elements.forEach(function(element, idx) {
      element.on('change', function(event) {
        if (event.error) {
          error.classList.add('visible');
          savedErrors[idx] = event.error.message;
          errorMessage.innerText = event.error.message;
        } else {
          savedErrors[idx] = null;
  
          // Loop over the saved errors and find the first one, if any.
          var nextError = Object.keys(savedErrors)
            .sort()
            .reduce(function(maybeFoundError, key) {
              return maybeFoundError || savedErrors[key];
            }, null);
  
          if (nextError) {
            // Now that they've fixed the current error, show another one.
            errorMessage.innerText = nextError;
          } else {
            // The user fixed the last error; no more errors.
            error.classList.remove('visible');
          }
        }
      });
    });
  
    // Listen on the form's 'submit' handler...
    form.addEventListener('submit', function(e) {
      e.preventDefault();
  
      // Trigger HTML5 validation UI on the form if any of the inputs fail
      // validation.
      var plainInputsValid = true;
      Array.prototype.forEach.call(form.querySelectorAll('input'), function(
        input
      ) {
        if (input.checkValidity && !input.checkValidity()) {
          plainInputsValid = false;
          return;
        }
      });
      if (!plainInputsValid) {
        triggerBrowserValidation();
        return;
      }
  
      // Show a loading screen...
      example.classList.add('submitting');
  
      // Disable all inputs.
      disableInputs();
  
      // Gather additional customer data we may have collected in our form.
      var nme = form.querySelector('#' + exampleName + '-name');
      var email = form.querySelector('#' + exampleName + '-email');
      var address1 = form.querySelector('#' + exampleName + '-address');
      var city = form.querySelector('#' + exampleName + '-city');
      var state = form.querySelector('#' + exampleName + '-state');
      var zip = form.querySelector('#' + exampleName + '-zip');
      // var additionalData = {
      //   name: name ? name.value : undefined,
      //   address_line1: address1 ? address1.value : undefined,
      //   address_city: city ? city.value : undefined,
      //   address_state: state ? state.value : undefined,
      //   address_zip: zip ? zip.value : undefined,
      // };
  
      // Use Stripe.js to create a token. We only need to pass in one Element
      // from the Element group in order to create a token. We can also pass
      // in the additional customer data we collected in our form.
      // stripe.createToken(elements[0], additionalData).then(function(result) {
      //   // Stop loading!
      //   example.classList.remove('submitting');
  
      //   if (result.token) {
      //     // If we received a token, show the token ID.
      //     example.querySelector('.token').innerText = result.token.id;
      //     example.classList.add('submitted');
      //   } else {
      //     // Otherwise, un-disable inputs.
      //     enableInputs();
      //   }
      // });
      stripe
      .confirmCardPayment(window.vm.client_secret, {
        payment_method: {
          card: elements[0],
          //card: card,
        },
        receipt_email:  email ? email.value : undefined,
        shipping: {
          address: {
            line1: address1 ? address1.value : undefined,
            //line2: 'code2',
            city: city ? city.value : undefined,
            state: state ? state.value : undefined,
            postal_code: zip ? zip.value : undefined,
            //country: 'US'
          },
          name:  nme ? nme.value : undefined,
        },
      })
      .then(function(result) {
        // Stop loading!
        example.classList.remove('submitting');
        if (result.error) {
          console.log(result)
          enableInputs();
          error.classList.add('visible');
          errorMessage.innerText = "Charging error, check card details."
        } else {
          // The payment succeeded!
          //orderComplete(result.paymentIntent.id);
          //example.querySelector('.token').innerText = result
          //example.querySelector('.token').innerText = result.token.id;
          console.log('stripe resp: ', result)
          window.vm.postOrderToBackend(result);
          window.vm.userEmail = email.value;
          example.classList.add('submitted');
        }
      });
    });
  
    resetButton.addEventListener('click', function(e) {
      e.preventDefault();
      // Resetting the form (instead of setting the value to `''` for each input)
      // helps us clear webkit autofill styles.
      form.reset();
  
      // Clear each Element.
      elements.forEach(function(element) {
        element.clear();
      });
  
      // Reset error state as well.
      error.classList.remove('visible');
  
      // Resetting the form does not un-disable inputs, so we need to do it separately:
      enableInputs();
      example.classList.remove('submitted');
    });
  }







  var elements = stripe.elements();

  /**
   * Card Element
   */
  var card = elements.create("card", {
    iconStyle: "solid",
    style: {
      base: {
        iconColor: "#fff",
        color: "#fff",
        fontWeight: 400,
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        fontSize: "16px",
        fontSmoothing: "antialiased",

        "::placeholder": {
          color: "#BFAEF6"
        },
        ":-webkit-autofill": {
          color: "#fce883"
        }
      },
      invalid: {
        iconColor: "#FFC7EE",
        color: "#FFC7EE"
      }
    }
  });
  card.mount("#example5-card");

  /**
   * Payment Request Element
   */
  // var paymentRequest = stripe.paymentRequest({
  //   country: "US",
  //   currency: "usd",
  //   total: {
  //     amount: 2500,
  //     label: "Total"
  //   },
  //   requestShipping: true,
  //   shippingOptions: [
  //     {
  //       id: "free-shipping",
  //       label: "Free shipping",
  //       detail: "Arrives in 5 to 7 days",
  //       amount: 0
  //     }
  //   ]
  // });
  // paymentRequest.on("token", function(result) {
  //   var example = document.querySelector(".example5");
  //   example.querySelector(".token").innerText = result.token.id;
  //   example.classList.add("submitted");
  //   result.complete("success");
  // });

  // var paymentRequestElement = elements.create("paymentRequestButton", {
  //   paymentRequest: paymentRequest,
  //   style: {
  //     paymentRequestButton: {
  //       theme: "light"
  //     }
  //   }
  // });

  // paymentRequest.canMakePayment().then(function(result) {
  //   if (result) {
  //     document.querySelector(".example5 .card-only").style.display = "none";
  //     document.querySelector(
  //       ".example5 .payment-request-available"
  //     ).style.display =
  //       "block";
  //     paymentRequestElement.mount("#example5-paymentRequest");
  //   }
  // });

  registerElements([card], "example5");
};