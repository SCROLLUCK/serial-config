export interface StatusRequest {
  loading: boolean;
  errors: any[] | null;
}

export interface Status {
  load: StatusRequest;
  delete: StatusRequest;
  update: StatusRequest;
  register: StatusRequest;
}
