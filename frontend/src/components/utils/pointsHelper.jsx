const LOCAL_STORAGE_KEY = 'userGamePoints';
const MAX_POINTS = 100000;

export function getCurrentPoints() {
  const points = localStorage.getItem(LOCAL_STORAGE_KEY);
  return points ? parseInt(points, 10) : 0;
}

export function getMaxPoints() {
  return MAX_POINTS;
}

export function addGamePoints(pointsToAdd) {
  const currentPoints = getCurrentPoints();
  const newPoints = Math.min(currentPoints + pointsToAdd, MAX_POINTS);
  localStorage.setItem(LOCAL_STORAGE_KEY, newPoints.toString());
  return newPoints;  // Возвращаем новые очки, чтобы компоненты могли их получить
}

export function resetPoints() {
  localStorage.setItem(LOCAL_STORAGE_KEY, '0');
}


