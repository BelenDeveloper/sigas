import { atom } from "jotai";

import { MOCK_PROJECTS, type Project } from "@/lib/mocks/projects.mock";

export const projectsAtom = atom<Project[]>(MOCK_PROJECTS);
