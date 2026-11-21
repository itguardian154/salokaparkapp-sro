import FilterBar from "@/components/Filter/filter-bar";
import TablePagination from "@/components/data-table/table-pagination";
import { useMemo, useState } from "react";
import ArrivalGroupCard from "../components/arrival-group-card";
import ArrivalSummary from "../components/arrival-summary";
import { dummyArrivals } from "../data/dummy-arrivals";
import type { ArrivalStatus, CateringStatus } from "../types/arrival-control";

export default function ArrivalCotrolPage() {
  const [groups, setGroups] = useState(dummyArrivals);
  const [search, setSearch] = useState("");
  const [itemPerPage, setItemPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return groups;
    return groups.filter((group) =>
      [group.schoolName, group.city, group.salesName].some((value) =>
        value.toLocaleLowerCase().includes(query),
      ),
    );
  }, [groups, search]);

  const lastPage = Math.max(1, Math.ceil(filteredGroups.length / itemPerPage));
  const pageGroups = filteredGroups.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage,
  );
  const arrivedCount = groups.filter(
    (group) => group.arrivalStatus !== "belum_datang",
  ).length;
  const notArrivedCount = groups.filter(
    (group) => group.arrivalStatus === "belum_datang",
  ).length;

  const updateArrivalStatus = (id: number, status: ArrivalStatus) => {
    setGroups((current) =>
      current.map((group) =>
        group.id === id ? { ...group, arrivalStatus: status } : group,
      ),
    );
  };

  const updateCateringStatus = (id: number, status: CateringStatus) => {
    setGroups((current) =>
      current.map((group) =>
        group.id === id
          ? {
              ...group,
              cateringStatus: status,
              arrivalStatus:
                status === "selesai" && group.arrivalStatus === "masuk_in_park"
                  ? "sudah_makan"
                  : group.arrivalStatus,
            }
          : group,
      ),
    );
  };

  const addTicketEntry = (id: number) => {
    setGroups((current) =>
      current.map((group) =>
        group.id === id
          ? {
              ...group,
              enteredTickets: Math.min(
                group.totalTickets,
                group.enteredTickets + 10,
              ),
            }
          : group,
      ),
    );
  };

  return (
    <section className="min-h-0 min-w-0 flex-1 space-y-5 overflow-y-auto pb-2">
      <ArrivalSummary
        total={groups.length}
        arrived={arrivedCount}
        notArrived={notArrivedCount}
      />

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
        <TablePagination
          rightSlot={
            <div className="hidden w-full md:block">
              <FilterBar
                search={search}
                onSearchChange={(value) => {
                  setSearch(value);
                  setCurrentPage(1);
                }}
                placeholder="Cari rombongan..."
                debounceDelay={250}
              />
            </div>
          }
          itemPerPage={itemPerPage}
          setItemPerPage={(value) => {
            setItemPerPage(value);
            setCurrentPage(1);
          }}
          currentPage={currentPage}
          lastPage={lastPage}
          fromPage={
            filteredGroups.length ? (currentPage - 1) * itemPerPage + 1 : 0
          }
          toPage={Math.min(currentPage * itemPerPage, filteredGroups.length)}
          totalData={filteredGroups.length}
          onPrev={() => setCurrentPage((page) => Math.max(1, page - 1))}
          onNext={() => setCurrentPage((page) => Math.min(lastPage, page + 1))}
        />
      </div>

      <div className="hidden lg:block flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md md:hidden">
          <FilterBar
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            placeholder="Cari rombongan..."
            debounceDelay={250}
          />
        </div>
      </div>

      <div className="space-y-4">
        {pageGroups.length ? (
          pageGroups.map((group) => (
            <ArrivalGroupCard
              key={group.id}
              group={group}
              onArrivalStatusChange={updateArrivalStatus}
              onCateringStatusChange={updateCateringStatus}
              onTicketEntry={addTicketEntry}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            Rombongan tidak ditemukan.
          </div>
        )}
      </div>
    </section>
  );
}
