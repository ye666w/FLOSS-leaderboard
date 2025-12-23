export const clientError = (res, status, message) => {
  return res.status(status).json({ success: false, error: message })
}

export const parseOrder = (order) => {
  return order === 'desc' ? 'desc' : 'asc'
}