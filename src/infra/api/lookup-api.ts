import axios, { endpoints } from 'src/utils/axios';
import { useUserStore } from 'src/store';

// ----------------------------------------------------------------------

function getTenantId() {
  return useUserStore.getState().user?.tenantID || 1;
}

function getUserRoleType() {
  return useUserStore.getState().user?.userRoleType || 1;
}

// ----------------------------------------------------------------------

export async function getProjectSettingsApi() {
  const res = await axios.post(endpoints.project.settings);
  return res.data;
}

export async function getProjectStatusesApi() {
  const res = await axios.get(endpoints.project.status(getTenantId()));
  return res.data;
}

export async function getCompaniesApi() {
  const res = await axios.get(endpoints.project.company(getTenantId()));
  return res.data;
}

export async function getDepartmentsApi() {
  const res = await axios.get(endpoints.project.department(getTenantId()));
  return res.data;
}

export async function getCurrenciesApi() {
  const res = await axios.get(endpoints.project.currency(getTenantId()));
  return res.data;
}

export async function getJobTypesApi() {
  const res = await axios.get(endpoints.project.jobType(getTenantId()));
  return res.data;
}

export async function getPortfoliosApi() {
  const res = await axios.get(endpoints.project.portfolio(getTenantId()));
  return res.data;
}

export async function getTemplatesApi() {
  const res = await axios.get(endpoints.project.templates(getTenantId()));
  return res.data;
}

export async function getTemplateDetailsApi(templateId: number) {
  const res = await axios.get(endpoints.project.templateDetails(templateId));
  return res.data;
}

export async function getUsersApi() {
  const res = await axios.get(endpoints.project.users(getTenantId(), getUserRoleType()));
  return res.data;
}

export async function getGroupsApi() {
  const res = await axios.get(endpoints.project.group(getTenantId()));
  return res.data;
}

export async function getCategoriesApi() {
  const res = await axios.get(endpoints.project.category(getTenantId()));
  return res.data;
}

export async function getCustomFieldsApi() {
  const res = await axios.get(endpoints.project.customFields(getTenantId()));
  return res.data;
}
