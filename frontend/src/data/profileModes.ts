import { ProfileData } from '../types';

export const generalProfile: ProfileData = {
  hero: {
    badge: "",
    titleName: "",
    headline: "",
    subtext: "",
    trustRow: []
  },
  projects: [],
  skills: [],
  certifications: [],
  journey: [],
  blogs: [],
  philosophy: ""
};

export const dataEngineerProfile: ProfileData = {
  ...generalProfile
};
