export function getToken() {
  return "Bearer " + localStorage.getItem("token")
}

export function setToken(token) {
  localStorage.setItem("token", token)
}