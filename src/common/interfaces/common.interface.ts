
export interface IDynamicObject<T = any> {
    [key: string]: T;
}
export interface ISearchOptions<T = IDynamicObject> {
    filters?: T;
    order?: IDynamicObject;
    sort?: IDynamicObject;
    projection?: IDynamicObject;
    pageSize?: number;
    page?: number;
    offset?: number;
}
export interface IPaginatedResult<T> {
    items: T[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalRecords: number;
    };
}