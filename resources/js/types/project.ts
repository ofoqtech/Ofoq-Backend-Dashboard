export type MultilingualString = {
    ar?: string;
    en?: string;
};

export type ProjectMetric = {
    label: string;
    val: string;
};

export type ProjectCategory = {
    id: string;
    label: string;
    label_ar?: string;
    name_en?: string;
    name_ar?: string;
    slug?: string;
};

export type Category = {
    id: number;
    slug: string;
    name: MultilingualString | string;
    name_ar?: string | null;
    name_en?: string | null;
    description?: MultilingualString | string | null;
    description_ar?: string | null;
    description_en?: string | null;
    order: number;
    is_active: boolean;
    projects_count?: number;
    created_at?: string;
    updated_at?: string;
};

export type ProjectImage = {
    id: number;
    project_id: number;
    path: string;
    url?: string;
    caption?: MultilingualString | null;
    caption_ar?: string | null;
    caption_en?: string | null;
    display_order: number;
    created_at?: string;
    updated_at?: string;
};

export type Project = {
    id: number;
    slug: string;
    category: string;
    category_label: MultilingualString | string;
    category_label_ar?: string | null;
    category_label_en?: string | null;
    title: MultilingualString | string;
    title_ar?: string | null;
    title_en?: string | null;
    tagline?: MultilingualString | string | null;
    tagline_ar?: string | null;
    tagline_en?: string | null;
    description?: MultilingualString | string | null;
    description_ar?: string | null;
    description_en?: string | null;
    problem?: MultilingualString | string | null;
    problem_ar?: string | null;
    problem_en?: string | null;
    solution?: MultilingualString | string | null;
    solution_ar?: string | null;
    solution_en?: string | null;
    image?: string | null;
    gallery?: string[] | null;
    images?: ProjectImage[];
    technologies?: string[] | null;
    metrics?: { ar?: ProjectMetric[]; en?: ProjectMetric[] } | ProjectMetric[] | null;
    metrics_ar?: ProjectMetric[] | null;
    metrics_en?: ProjectMetric[] | null;
    features?: { ar?: string[]; en?: string[] } | string[] | null;
    features_ar?: string[] | null;
    features_en?: string[] | null;
    client?: string | null;
    live_url?: string | null;
    is_featured: boolean;
    order: number;
    created_at: string;
    updated_at: string;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};
