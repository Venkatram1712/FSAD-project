export interface CareerResource {
  id: string;
  title: string;
  category: string;
  views: number;
  createdAt: string;
}

export const CAREER_RESOURCES_STORAGE_KEY = 'careerResources';

const defaultCareerResources: CareerResource[] = [
  { id: '1', title: 'Software Engineering Guide', views: 523, category: 'Technology', createdAt: '2026-02-18' },
  { id: '2', title: 'Data Science Pathway', views: 412, category: 'Technology', createdAt: '2026-02-17' },
  { id: '3', title: 'Business Management Career', views: 387, category: 'Business', createdAt: '2026-02-16' },
];

export function getCareerResources(): CareerResource[] {
  const stored = localStorage.getItem(CAREER_RESOURCES_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(CAREER_RESOURCES_STORAGE_KEY, JSON.stringify(defaultCareerResources));
    return defaultCareerResources;
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(CAREER_RESOURCES_STORAGE_KEY, JSON.stringify(defaultCareerResources));
      return defaultCareerResources;
    }
    return parsed;
  } catch {
    localStorage.setItem(CAREER_RESOURCES_STORAGE_KEY, JSON.stringify(defaultCareerResources));
    return defaultCareerResources;
  }
}

export function saveCareerResources(resources: CareerResource[]) {
  localStorage.setItem(CAREER_RESOURCES_STORAGE_KEY, JSON.stringify(resources));
}

export function createCareerResource(title: string, category: string): CareerResource {
  return {
    id: Date.now().toString(),
    title: title.trim(),
    category: category.trim(),
    views: 0,
    createdAt: new Date().toISOString().split('T')[0],
  };
}