import type { ColumnType } from "kysely";

export type Decimal = ColumnType<string, number | string, number | string>;

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface AngelTypes {
  contact_dect: Generated<string>;
  contact_email: Generated<string>;
  contact_name: Generated<string>;
  description: Generated<string>;
  hide_on_shift_view: Generated<number>;
  hide_register: Generated<number>;
  id: Generated<number>;
  name: string;
  requires_driver_license: Generated<number>;
  requires_ifsg_certificate: Generated<number>;
  restricted: Generated<number>;
  shift_self_signup: Generated<number>;
  show_on_dashboard: Generated<number>;
}

export interface EventConfig {
  created_at: Generated<Date | null>;
  name: string;
  updated_at: Generated<Date | null>;
  value: string;
}

export interface Faq {
  created_at: Generated<Date | null>;
  id: Generated<number>;
  question: string;
  text: string;
  updated_at: Generated<Date | null>;
}

export interface GroupPrivileges {
  group_id: number;
  id: Generated<number>;
  privilege_id: number;
}

export interface Groups {
  id: Generated<number>;
  name: string;
}

export interface Locations {
  created_at: Generated<Date | null>;
  dect: Generated<string | null>;
  description: Generated<string | null>;
  id: Generated<number>;
  map_url: Generated<string | null>;
  name: string;
  updated_at: Generated<Date | null>;
}

export interface LogEntries {
  created_at: Generated<Date | null>;
  id: Generated<number>;
  level: string;
  message: string;
  user_id: Generated<number | null>;
}

export interface Messages {
  created_at: Generated<Date | null>;
  id: Generated<number>;
  read: Generated<number>;
  receiver_id: number;
  text: string;
  updated_at: Generated<Date | null>;
  user_id: number;
}

export interface Migrations {
  id: Generated<number>;
  migration: string;
}

export interface NeededAngelTypes {
  angel_type_id: number;
  count: number;
  id: Generated<number>;
  location_id: Generated<number | null>;
  shift_id: Generated<number | null>;
  shift_type_id: Generated<number | null>;
}

export interface News {
  created_at: Generated<Date | null>;
  id: Generated<number>;
  is_highlighted: Generated<number>;
  is_meeting: Generated<number>;
  is_pinned: Generated<number>;
  text: string;
  title: string;
  updated_at: Generated<Date | null>;
  user_id: number;
}

export interface NewsComments {
  created_at: Generated<Date | null>;
  id: Generated<number>;
  news_id: number;
  text: string;
  updated_at: Generated<Date | null>;
  user_id: number;
}

export interface Oauth {
  access_token: Generated<string | null>;
  created_at: Generated<Date | null>;
  expires_at: Generated<Date | null>;
  id: Generated<number>;
  identifier: string;
  provider: string;
  refresh_token: Generated<string | null>;
  updated_at: Generated<Date | null>;
  user_id: number;
}

export interface PasswordResets {
  created_at: Generated<Date | null>;
  token: string;
  user_id: number;
}

export interface Privileges {
  description: string;
  id: Generated<number>;
  name: string;
}

export interface Questions {
  answer: Generated<string | null>;
  answered_at: Generated<Date | null>;
  answerer_id: Generated<number | null>;
  created_at: Generated<Date | null>;
  id: Generated<number>;
  text: string;
  updated_at: Generated<Date | null>;
  user_id: number;
}

export interface ScheduleLocations {
  id: Generated<number>;
  location_id: number;
  schedule_id: number;
}

export interface Schedules {
  created_at: Generated<Date | null>;
  id: Generated<number>;
  minutes_after: number;
  minutes_before: number;
  name: string;
  needed_from_shift_type: Generated<number>;
  shift_type: number;
  updated_at: Generated<Date | null>;
  url: string;
}

export interface ScheduleShift {
  guid: string;
  schedule_id: number;
  shift_id: number;
}

export interface Sessions {
  id: string;
  last_activity: Generated<Date>;
  payload: string;
  user_id: Generated<number | null>;
}

export interface ShiftEntries {
  angel_type_id: number;
  freeloaded: Generated<number>;
  freeloaded_comment: Generated<string>;
  id: Generated<number>;
  shift_id: number;
  user_comment: Generated<string>;
  user_id: number;
}

export interface Shifts {
  created_at: Generated<Date | null>;
  created_by: number;
  description: Generated<string>;
  end: Date;
  id: Generated<number>;
  location_id: number;
  shift_type_id: number;
  start: Date;
  title: string;
  transaction_id: Generated<string | null>;
  updated_at: Generated<Date | null>;
  updated_by: Generated<number | null>;
  url: Generated<string>;
}

export interface ShiftTypes {
  description: string;
  id: Generated<number>;
  name: string;
}

export interface UserAngelType {
  angel_type_id: number;
  confirm_user_id: Generated<number | null>;
  id: Generated<number>;
  supporter: Generated<number>;
  user_id: number;
}

export interface Users {
  api_key: string;
  created_at: Generated<Date | null>;
  email: string;
  id: Generated<number>;
  last_login_at: Generated<Date | null>;
  name: string;
  password: string;
  updated_at: Generated<Date | null>;
}

export interface UsersContact {
  dect: Generated<string | null>;
  email: Generated<string | null>;
  mobile: Generated<string | null>;
  user_id: number;
}

export interface UsersGroups {
  group_id: number;
  id: Generated<number>;
  user_id: number;
}

export interface UsersLicenses {
  drive_12t: Generated<number>;
  drive_3_5t: Generated<number>;
  drive_7_5t: Generated<number>;
  drive_car: Generated<number>;
  drive_confirmed: Generated<number>;
  drive_forklift: Generated<number>;
  has_car: Generated<number>;
  ifsg_certificate: Generated<number>;
  ifsg_certificate_light: Generated<number>;
  ifsg_confirmed: Generated<number>;
  user_id: number;
}

export interface UsersPersonalData {
  first_name: Generated<string | null>;
  last_name: Generated<string | null>;
  planned_arrival_date: Generated<Date | null>;
  planned_departure_date: Generated<Date | null>;
  pronoun: Generated<string | null>;
  shirt_size: Generated<string | null>;
  user_id: number;
}

export interface UsersSettings {
  email_goodie: Generated<number>;
  email_human: Generated<number>;
  email_messages: Generated<number>;
  email_news: Generated<number>;
  email_shiftinfo: Generated<number>;
  language: string;
  mobile_show: Generated<number>;
  theme: number;
  user_id: number;
}

export interface UsersState {
  active: Generated<number>;
  arrival_date: Generated<Date | null>;
  arrived: Generated<number>;
  force_active: Generated<number>;
  got_goodie: Generated<number>;
  got_voucher: Generated<number>;
  user_id: number;
  user_info: Generated<string | null>;
}

export interface Worklogs {
  comment: string;
  created_at: Generated<Date | null>;
  creator_id: number;
  hours: Decimal;
  id: Generated<number>;
  updated_at: Generated<Date | null>;
  user_id: number;
  worked_at: Date;
}

export interface DB {
  angel_types: AngelTypes;
  event_config: EventConfig;
  faq: Faq;
  group_privileges: GroupPrivileges;
  groups: Groups;
  locations: Locations;
  log_entries: LogEntries;
  messages: Messages;
  migrations: Migrations;
  needed_angel_types: NeededAngelTypes;
  news: News;
  news_comments: NewsComments;
  oauth: Oauth;
  password_resets: PasswordResets;
  privileges: Privileges;
  questions: Questions;
  schedule_locations: ScheduleLocations;
  schedule_shift: ScheduleShift;
  schedules: Schedules;
  sessions: Sessions;
  shift_entries: ShiftEntries;
  shift_types: ShiftTypes;
  shifts: Shifts;
  user_angel_type: UserAngelType;
  users: Users;
  users_contact: UsersContact;
  users_groups: UsersGroups;
  users_licenses: UsersLicenses;
  users_personal_data: UsersPersonalData;
  users_settings: UsersSettings;
  users_state: UsersState;
  worklogs: Worklogs;
}
