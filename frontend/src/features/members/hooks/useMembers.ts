import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Member, MemberForm } from "../../shared/types";
import { getMembers, createMember, updateMember } from "../api/members";

export const useMembers = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");

  /* ================= FETCH ================= */
  const {
    data: members = [],
    isLoading: loading,
    error,
  } = useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: getMembers,
  });

  /* ================= CREATE ================= */
  const { mutateAsync: addMember, isPending: creating } = useMutation({
    mutationFn: (form: MemberForm) => createMember(form),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  /* ================= UPDATE ================= */
  const { mutateAsync: updateMemberMutation, isPending: updating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MemberForm }) =>
      updateMember(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  const updateMemberHandler = async (id: number, data: MemberForm) => {
    return updateMemberMutation({ id, data });
  };

  /* ================= FILTERED MEMBERS ================= */
  const filteredMembers = useMemo(() => {
    return members.filter((m) =>
      `${m.firstName} ${m.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [members, search]);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    return {
      total: members.length,
      active: members.filter((m) => m.status === "active").length,
      inactive: members.filter((m) => m.status === "inactive").length,
    };
  }, [members]);

  return {
    members,
    filteredMembers,
    loading,
    error,

    search,
    setSearch,

    addMember,
    creating,

    updateMember: updateMemberHandler, // ✅ IMPORTANT

    updating,

    stats,
  };
};