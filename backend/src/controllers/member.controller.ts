import { Request, Response } from "express";
import { db } from "../db/connection";
import { logAction } from "../utils/logger";
import type { MemberDTO } from "../types/member.dto";
import {generateMemberCode} from "../utils/memberCode";

export const createMember = (req: Request, res: Response) => {
  const data: MemberDTO = req.body;
  const user = (req as any).user;

  console.log("📦 BODY:", req.body);
  console.log("👤 USER:", user);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized - missing user" });
  }

  const {
    lastName,
    firstName,
    middleName,
    suffix,
    birthDate,
    birthPlace,
    civilStatus,
    sex,
    position,
    originalAppointment,
    office,
    salaryGrade,
    presentAddress,
    permanentAddress,
    memberSince,
    cscEligibility,
    bloodType,
    tin,
    mobile,
    telephone,
    email,
    soloParent,
    lgbtq,
    pwd,
    spouse,
    children,
    parents,
  } = data;

  // ✅ FIX: use insertId later instead of user.memberId
  const memberCode = `TEMP-${Date.now()}`; // temporary safe placeholder

  // ================= INSERT MEMBER =================
  const sql = `
    INSERT INTO members (
      member_code, last_name, first_name, middle_name, suffix,
      birth_date, birth_place, civil_status, sex,
      position, original_appointment, office, salary_grade,
      present_address, permanent_address,
      member_since, csc_eligibility, blood_type,
      tin, mobile, telephone, email,
      solo_parent, lgbtq, pwd,
      status,
      created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    memberCode,
    lastName,
    firstName,
    middleName,
    suffix,
    birthDate,
    birthPlace,
    civilStatus,
    sex,
    position,
    originalAppointment,
    office,
    salaryGrade,
    presentAddress,
    permanentAddress,
    memberSince,
    cscEligibility,
    bloodType,
    tin,
    mobile,
    telephone,
    email,
    soloParent ? 1 : 0,
    lgbtq ? 1 : 0,
    pwd ? 1 : 0,
    "active",
    user.adminId,
  ];

  db.query(sql, values, (err, result: any) => {
    if (err) {
      console.error("CREATE MEMBER ERROR:", err);
      return res.status(500).json({ message: "Failed to create member" });
    }

    const memberId = result.insertId;

    // ✅ FINAL MEMBER CODE (SAFE AFTER INSERT)
    const finalCode = generateMemberCode(memberId);

    db.query(
      "UPDATE members SET member_code = ? WHERE id = ?",
      [finalCode, memberId]
    );

    // ================= SPOUSE =================
    if (spouse?.enabled) {
      db.query(
        `INSERT INTO spouses 
        (member_id, name, birth_date, profession, employer, is_beneficiary)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          memberId,
          spouse.name,
          spouse.birthDate,
          spouse.profession,
          spouse.employer,
          spouse.isBeneficiary ? 1 : 0,
        ]
      );
    }

    // ================= CHILDREN =================
    if (children?.length) {
      for (const c of children) {
        db.query(
          `INSERT INTO children 
          (member_id, name, birth_date, is_beneficiary)
          VALUES (?, ?, ?, ?)`,
          [
            memberId,
            c.name,
            c.birthDate,
            c.isBeneficiary ? 1 : 0,
          ]
        );
      }
    }

    // ================= PARENTS =================
    if (parents?.length) {
      for (const p of parents) {
        db.query(
          `INSERT INTO parents 
          (member_id, name, birth_date, is_beneficiary)
          VALUES (?, ?, ?, ?)`,
          [
            memberId,
            p.name,
            p.birthDate,
            p.isBeneficiary ? 1 : 0,
          ]
        );
      }
    }

    // ================= LOG =================
    logAction("CREATE_MEMBER", `Created ${firstName} ${lastName}`, {
      id: user.adminId,
      role: user.role,
    });

    return res.json({
      message: "Member created successfully",
      memberId,
      memberCode: finalCode,
    });
  });
};

export const getMembers = (_req: Request, res: Response) => {
  const sql = `
    SELECT 
      id,
      last_name AS lastName,
      first_name AS firstName,
      middle_name AS middleName,
      suffix,
      birth_date AS birthDate,
      birth_place AS birthPlace,
      civil_status AS civilStatus,
      sex,
      position,
      original_appointment AS originalAppointment,
      office,
      salary_grade AS salaryGrade,
      present_address AS presentAddress,
      permanent_address AS permanentAddress,
      member_since AS memberSince,
      csc_eligibility AS cscEligibility,
      blood_type AS bloodType,
      tin,
      mobile,
      telephone,
      email,
      solo_parent AS soloParent,
      lgbtq,
      pwd,
      status
    FROM members
    ORDER BY id DESC
  `;

  db.query(sql, (err, results: any[]) => {
    if (err) {
      console.error("GET MEMBERS ERROR:", err);
      return res.status(500).json({ message: "Failed to fetch members" });
    }

    return res.json(results);
  });
};

export const updateMember = (req: Request, res: Response) => {
  const id = req.params.id;
  const data: MemberDTO = req.body;

  const {
    lastName,
    firstName,
    middleName,
    suffix,
    birthDate,
    birthPlace,
    civilStatus,
    sex,
    position,
    originalAppointment,
    office,
    salaryGrade,
    presentAddress,
    permanentAddress,
    memberSince,
    cscEligibility,
    bloodType,
    tin,
    mobile,
    telephone,
    email,
    soloParent,
    lgbtq,
    pwd,
    status,
  } = data;

  const sql = `
    UPDATE members SET
      last_name = ?,
      first_name = ?,
      middle_name = ?,
      suffix = ?,
      birth_date = ?,
      birth_place = ?,
      civil_status = ?,
      sex = ?,
      position = ?,
      original_appointment = ?,
      office = ?,
      salary_grade = ?,
      present_address = ?,
      permanent_address = ?,
      member_since = ?,
      csc_eligibility = ?,
      blood_type = ?,
      tin = ?,
      mobile = ?,
      telephone = ?,
      email = ?,
      solo_parent = ?,
      lgbtq = ?,
      pwd = ?,
      status = ?
    WHERE id = ?
  `;

  const values = [
    lastName,
    firstName,
    middleName,
    suffix,
    birthDate,
    birthPlace,
    civilStatus,
    sex,
    position,
    originalAppointment,
    office,
    salaryGrade,
    presentAddress,
    permanentAddress,
    memberSince,
    cscEligibility,
    bloodType,
    tin,
    mobile,
    telephone,
    email,
    soloParent ? 1 : 0,
    lgbtq ? 1 : 0,
    pwd ? 1 : 0,
    status,
    id,
  ];

  db.query(sql, values, (err) => {
    if (err) {
      console.error("UPDATE MEMBER ERROR:", err);
      return res.status(500).json({ message: "Failed to update member" });
    }

    logAction("UPDATE_MEMBER", `Updated member ID ${id}`, {
      id: (req as any).user?.adminId,
      role: (req as any).user?.role,
    });

    return res.json({ message: "Member updated successfully" });
  });
};

export const deleteMember = (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // delete relations first
  db.query("DELETE FROM spouses WHERE member_id = ?", [id]);
  db.query("DELETE FROM children WHERE member_id = ?", [id]);
  db.query("DELETE FROM parents WHERE member_id = ?", [id]);

  // delete member
  db.query("DELETE FROM members WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("DELETE MEMBER ERROR:", err);
      return res.status(500).json({ message: "Failed to delete member" });
    }

    logAction("DELETE_MEMBER", `Deleted member ID ${id}`, {
      id: user.adminId,
      role: user.role,
    });

    return res.json({ message: "Member deleted successfully" });
  });
};