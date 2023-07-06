export const checkPassword = (passwordInput) => {
    const passwordRequirements = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,25}$')

    return passwordRequirements.test(passwordInput)
  }