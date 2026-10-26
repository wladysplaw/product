export function toTextureGridY(domY: number, rows: number) {
  return domY * rows;
}

export function toTextureVelocityY(domVelocityY: number) {
  return -domVelocityY;
}
