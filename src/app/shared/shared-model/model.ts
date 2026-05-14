export interface ResponseHeader {
  statusCode: number;
  result: any;
  isSuccess: boolean;
  msg: string;
}

export interface CurrentUser {
  token: string;
  userDto: UserDto;
  roleDto: RoleDto;
}

interface UserDto {
  id: number;
  firstName: string;
  nationalId: string | null;
  lastName: string;
  phoneNumber: string;
  email: string;
}

interface RoleDto {
  id: number;
  roleName: string;
  roleCode: string;
}


export interface AppConfig {
  success: boolean;
  data: Data;
}

export interface Data {
  domain: string;
  name: string;
  logo: string;
  address: string;
  description: string;
  aboutus_title: string;
  aboutus_desc: string;
  colors: Colors;
  images_partner: string[];
}

export interface Colors {
  primary: string;
  secondary: string;
}