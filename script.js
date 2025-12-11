// Pure: Get form data as object
function getFormData (form) {
  var formData = new FormData(form)
  var data = {
    email: formData.get('email'),
    certified_diver: formData.get('certified_diver') === 'true',
    certified_instructor: formData.get('certified_instructor') === 'true',
    mobile: formData.get('mobile') || ''
  }
  return data
}

// Pure: Validate email format
function isValidEmail (email) {
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Side effect: Submit form data to Lambda
async function submitToLambda (data) {
  var lambdaUrl = 'https://madf3svxcjbwndceiow7rzi7vm0kswra.lambda-url.us-east-1.on.aws/'

  try {
    var response = await fetch(lambdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    })

    var result
    try {
      result = await response.json()
    } catch (jsonError) {
      throw new Error('Invalid response from server')
    }

    if (!response.ok) {
      var error = new Error(result.error || 'Something went wrong')
      error.statusCode = response.status
      error.result = result
      throw error
    }

    return result
  } catch (err) {
    // Re-throw if it's already our custom error
    if (err.statusCode) throw err

    // Network or CORS error
    throw new Error('Unable to connect to server. Please check your internet connection.')
  }
}

// Side effect: Show success message
function showSuccessMessage (email) {
  var successMessage = document.getElementById('success-message')
  var emailDisplay = document.querySelector('.success-email')

  emailDisplay.textContent = email
  successMessage.classList.add('show')
}

// Side effect: Hide success message
function hideSuccessMessage () {
  var successMessage = document.getElementById('success-message')
  successMessage.classList.remove('show')
}

// Side effect: Show error message
function showErrorMessage (message) {
  var errorMessage = document.getElementById('error-message')
  var errorText = document.querySelector('.error-text')

  errorText.textContent = message
  errorMessage.classList.add('show')
}

// Side effect: Hide error message
function hideErrorMessage () {
  var errorMessage = document.getElementById('error-message')
  errorMessage.classList.remove('show')
}

// Side effect: Handle form submission
function handleFormSubmit (event) {
  event.preventDefault()

  var form = event.target
  var data = getFormData(form)

  // Validate email
  if (!isValidEmail(data.email)) {
    showErrorMessage('Please enter a valid email address')
    return
  }

  // Submit to Lambda
  submitToLambda(data)
    .then(result => {
      console.log('Signup successful:', result)
      showSuccessMessage(data.email)
      form.reset()
    })
    .catch(error => {
      console.error('Signup error:', error)
      showErrorMessage(error.message || 'Something went wrong. Please try again.')
    })
}

// Side effect: Handle escape key
function handleKeyDown (event) {
  if (event.key === 'Escape') {
    var successMessage = document.getElementById('success-message')
    var errorMessage = document.getElementById('error-message')

    if (successMessage && successMessage.classList.contains('show')) {
      hideSuccessMessage()
    }
    if (errorMessage && errorMessage.classList.contains('show')) {
      hideErrorMessage()
    }
  }
}

// Side effect: Initialize form listener on page load
function init () {
  var form = document.getElementById('waitlist-form')
  if (form) {
    form.addEventListener('submit', handleFormSubmit)
  }

  var closeSuccessButton = document.getElementById('close-success')
  if (closeSuccessButton) {
    closeSuccessButton.addEventListener('click', hideSuccessMessage)
  }

  var closeErrorButton = document.getElementById('close-error')
  if (closeErrorButton) {
    closeErrorButton.addEventListener('click', hideErrorMessage)
  }

  // Listen for Escape key
  document.addEventListener('keydown', handleKeyDown)
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
