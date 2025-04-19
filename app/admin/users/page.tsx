import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guard";

import PaginationPlus from "@/components/shared/pagination-plus";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllUsers, deleteUser } from "@/lib/actions/user.actions";
import { formatId } from "@/lib/utils";
import Link from "next/link";
import DeleteDialog from "@/components/shared/delete-dialog";

export const metadata: Metadata = {
  title: "Admin Users List",
};

const AdminUsersPage = async (props: {
  searchParams: Promise<{ page: string; query: string }>;
}) => {
  await requireAdmin();
  const searchParams = await props.searchParams;

  const { page = "1", query: searchText } = searchParams;

  const users = await getAllUsers({ page: Number(page), query: searchText });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h1 className="h2-bold">Users</h1>
        {searchText && (
          <div className="w-full">
            <div className="flex items-center justify-center">
              Filtered by &quot;
              <strong className="text-xl">{searchText}</strong>&quot;{" "}
              <Link href={`/admin/users`}>
                <Button variant="outline" size="sm">
                  Remove Filter
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>NAME</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead>ROLE</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{formatId(user.id)}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="flex gap-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/users/${user.id}`}>Edit</Link>
                  </Button>
                  <DeleteDialog id={user.id} action={deleteUser} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users?.totalPages && users.totalPages > 1 && (
          <PaginationPlus page={page} totalPages={users.totalPages} />
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
