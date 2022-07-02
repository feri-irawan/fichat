const formatMessage = (user, text) => {
  const date = new Date()
  return {
    user,
    text,
    time: date.getHours() + '.' + date.getMinutes(),
  }
}

module.exports = {
  formatMessage,
}
