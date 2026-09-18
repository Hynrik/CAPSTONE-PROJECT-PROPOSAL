export interface Spouse {
  enabled: boolean;
  name: string;
  birthDate: string;
  profession: string;
  employer: string;
  isBeneficiary: boolean;
}

export interface Child {
  name: string;
  birthDate: string;
  isBeneficiary: boolean;
}

export interface Parent {
  name: string;
  birthDate: string;
  isBeneficiary: boolean;
}

export interface Member {
  id: number;
  member_code:string;

  lastName: string;
  firstName: string;
  middleName: string;
  suffix: string;

  birthDate: string;
  birthPlace: string;
  civilStatus: string;
  sex: string;

  position: string;
  originalAppointment: string;
  office: string;
  salaryGrade: string;

  presentAddress: string;
  permanentAddress: string;

  memberSince: string;
  cscEligibility: string;
  bloodType: string;

  tin: string;
  mobile: string;
  telephone: string;
  email: string;

  soloParent: boolean;
  lgbtq: boolean;
  pwd: boolean;

  spouse: Spouse;
  children: Child[];
  parents: Parent[];

  primeBeneficiary: {
    name: string;
    birthDate: string;
  };

  status: string;
}

export interface MemberForm {
  lastName: string;
  firstName: string;
  middleName: string;
  suffix: string;
  member_code:string;

  birthDate: string;
  birthPlace: string;
  civilStatus: string;
  sex: string;

  position: string;
  originalAppointment: string;
  office: string;
  salaryGrade: string;

  presentAddress: string;
  permanentAddress: string;

  memberSince: string;
  bloodType: string;
  tin: string;
  mobile: string;
  telephone:string;
  email: string;
  status: string;
  cscEligibility:string;

  soloParent: boolean;
  lgbtq: boolean;
  pwd: boolean;

  spouse: {
    enabled: boolean;
    name: string;   
    birthDate: string;
    profession: string;
    employer: string;
    isBeneficiary: boolean;
  };

  children: {
    name: string;
    birthDate: string;
    isBeneficiary: boolean;
  }[];

  parents: {
    name: string;
    birthDate: string;
    isBeneficiary: boolean;
  }[];

  primeBeneficiary: {
    name: string;
    birthDate: string;
  };
  
}
export interface MemberBase {
  lastName: string;
  firstName: string;
  middleName: string;
  suffix: string;

  birthDate: string;
  birthPlace: string;
  civilStatus: string;
  sex: string;

  position: string;
  originalAppointment: string;
  office: string;
  salaryGrade: string;

  presentAddress: string;
  permanentAddress: string;

  memberSince: string;
  cscEligibility: string;
  bloodType: string;

  tin: string;
  mobile: string;
  telephone: string;
  email: string;

  soloParent: boolean;
  lgbtq: boolean;
  pwd: boolean;

  spouse: Spouse;
  children: Child[];
  parents: Parent[];

  primeBeneficiary: {
    name: string;
    birthDate: string;
  };

  status: string;
}