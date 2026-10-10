import CryptoJS from "crypto-js";
import type { AuthProfile, StoredAuthProfile } from "../types/auth";

const AUTH_STORAGE_KEYS = [
  "departemen",
  "grade",
  "idDepartemen",
  "id_grade",
  "id_sub_dept",
  "namakaryawan",
  "username",
  "pos",
  "sub_departemen",
  "token",
] as const;
const LEGACY_AUTH_STORAGE_KEYS = [
  "username",
  "token_type",
  "sumNotif",
] as const;
const ENCRYPTION_KEY_CONTEXT = "sro.employee-id.encryption.v2";
const AUTHENTICATION_KEY_CONTEXT = "sro.employee-id.authentication.v2";
const CLIENT_ENCRYPTION_KEY = "sro-local-storage-employee-id-key";

function deriveKeys() {
  return {
    encryptionKey: CryptoJS.SHA256(
      `${ENCRYPTION_KEY_CONTEXT}:${CLIENT_ENCRYPTION_KEY}`,
    ),
    authenticationKey: CryptoJS.SHA256(
      `${AUTHENTICATION_KEY_CONTEXT}:${CLIENT_ENCRYPTION_KEY}`,
    ),
  };
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export function encryptEmployeeId(
  employeeId: string,
): string {
  const { encryptionKey, authenticationKey } = deriveKeys();
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(employeeId, encryptionKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const encodedIv = iv.toString(CryptoJS.enc.Base64);
  const encodedCiphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  const authenticatedData = `v2.${encodedIv}.${encodedCiphertext}`;
  const authenticationTag = CryptoJS.HmacSHA256(
    authenticatedData,
    authenticationKey,
  ).toString(CryptoJS.enc.Hex);

  return `${authenticatedData}.${authenticationTag}`;
}

export function decryptEmployeeId(
  encryptedEmployeeId: string,
): string {
  const [version, encodedIv, encodedCiphertext, authenticationTag] =
    encryptedEmployeeId.split(".");
  if (
    version !== "v2" ||
    !encodedIv ||
    !encodedCiphertext ||
    !authenticationTag
  ) {
    throw new Error("Format employee ID terenkripsi tidak valid.");
  }

  const { encryptionKey, authenticationKey } = deriveKeys();
  const authenticatedData = `v2.${encodedIv}.${encodedCiphertext}`;
  const expectedTag = CryptoJS.HmacSHA256(
    authenticatedData,
    authenticationKey,
  ).toString(CryptoJS.enc.Hex);

  if (!constantTimeEqual(authenticationTag, expectedTag)) {
    throw new Error("Employee ID terenkripsi tidak valid atau sudah diubah.");
  }

  const decrypted = CryptoJS.AES.decrypt(
    CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(encodedCiphertext),
    }),
    encryptionKey,
    {
      iv: CryptoJS.enc.Base64.parse(encodedIv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );

  return decrypted.toString(CryptoJS.enc.Utf8);
}

export function saveAuthSession(
  profile: Omit<AuthProfile, "employee_id"> & { employee_id: string },
): void {
  const encryptedEmployeeId = encryptEmployeeId(profile.employee_id);

  [...AUTH_STORAGE_KEYS, ...LEGACY_AUTH_STORAGE_KEYS].forEach((key) =>
    localStorage.removeItem(key),
  );

  localStorage.setItem("departemen", profile.department.name);
  localStorage.setItem("grade", profile.grade.name);
  localStorage.setItem("idDepartemen", profile.department.id);
  localStorage.setItem("id_grade", profile.grade.id);
  localStorage.setItem("id_sub_dept", profile.sub_department.id);
  localStorage.setItem("namakaryawan", profile.user.name);
  localStorage.setItem("username", encryptedEmployeeId);
  localStorage.setItem("pos", profile.position);
  localStorage.setItem("sub_departemen", profile.sub_department.name);
  localStorage.setItem("token", profile.token);
}

export function getAuthSession(): StoredAuthProfile | null {
  const employeeId = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const departmentId = localStorage.getItem("idDepartemen");
  const departmentName = localStorage.getItem("departemen");
  const gradeId = localStorage.getItem("id_grade");
  const gradeName = localStorage.getItem("grade");
  const subDepartmentId = localStorage.getItem("id_sub_dept");
  const subDepartmentName = localStorage.getItem("sub_departemen");
  const userName = localStorage.getItem("namakaryawan");
  const position = localStorage.getItem("pos");
  if (
    !employeeId ||
    !token ||
    !departmentId ||
    !departmentName ||
    !gradeId ||
    !gradeName ||
    !subDepartmentId ||
    !subDepartmentName ||
    !userName ||
    !position
  ) {
    return null;
  }

  return {
    department: { id: departmentId, name: departmentName },
    grade: { id: gradeId, name: gradeName },
    sub_department: { id: subDepartmentId, name: subDepartmentName },
    user: { name: userName },
    position,
    employee_id: employeeId,
    token,
  };
}

export function clearAuthSession(): void {
  [...AUTH_STORAGE_KEYS, ...LEGACY_AUTH_STORAGE_KEYS].forEach((key) =>
    localStorage.removeItem(key),
  );
}
