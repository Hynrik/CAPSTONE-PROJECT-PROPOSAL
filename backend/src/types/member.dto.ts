export interface MemberDTO {
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
  cscEligibility:string;
  telephone:string;

  presentAddress: string;
  permanentAddress: string;

  memberSince: string;
  bloodType: string;

  tin: string;
  mobile: string;
  email: string;
  status: string

  soloParent: boolean;
  lgbtq: boolean;
  pwd: boolean;

  spouse?: {
    enabled: boolean;
    name: string;
    birthDate: string;
    profession: string;
    employer: string;
    isBeneficiary: boolean;
  };

  children?: {
    name: string;
    birthDate: string;
    isBeneficiary: boolean;
  }[];

  parents?: {
    name: string;
    birthDate: string;
    isBeneficiary: boolean;
  }[];

  primeBeneficiary?: {
    name: string;
    birthDate: string;
  };
}