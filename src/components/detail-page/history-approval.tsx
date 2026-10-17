import DetailSection from "./detail-section";
import { QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type Approval = {
  action: string;
  grade: string;
  name: string;
};

type SROHistoryApprovalProps = {
  approvals?: Approval[];
};

export default function SROHistoryApproval({
  approvals = [],
}: SROHistoryApprovalProps) {
  return (
    <DetailSection icon={QrCode} title="History Approval">
      {/* Approval List */}
      {approvals.length > 0 ? (
        <div className="p-4">
          <div className="mt-4 w-full rounded-xl border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800">
            <div className="px-5 py-4 sm:px-6">
              <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-3 lg:grid-cols-4">
                {approvals.map((approval, index) => (
                  <div
                    key={index}
                    className="flex w-full flex-col items-center justify-center gap-1"
                  >
                    <span className="text-center text-sm tracking-wider text-slate-700 dark:text-slate-100">
                      {approval.action}
                    </span>

                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <QRCodeSVG
                        value="https://docs.google.com/spreadsheets/d/1H9c8T9BUKaq-X2wwWwhl9tF5Z0WgQCUHOeldTNceDy8/edit?gid=951962702#gid=951962702"
                        level="Q"
                        size={90}
                      />
                    </div>

                    <strong className="text-center text-sm text-slate-800 dark:text-slate-100">
                      {approval.grade}
                    </strong>

                    <span className="text-center text-sm underline underline-offset-4">
                      {approval.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 py-4 sm:px-6">
          <p className="text-sm text-slate-500">Belum ada history approval</p>{" "}
        </div>
      )}
    </DetailSection>
  );
}
