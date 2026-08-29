import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/http";
import type { Page, Task, TaskRequest, TaskStatus } from "../api/types";

export function useTasks() {
  const query = useInfiniteQuery({
    queryKey: ["tasks"],
    queryFn: ({ pageParam }) => api.listTasks(pageParam, 50),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1)
  });

  const tasks = query.data?.pages.flatMap((page) => page.content) ?? [];
  const lastPage = query.data?.pages[query.data.pages.length - 1];
  const totalCount = lastPage?.totalElements ?? tasks.length;

  return { ...query, tasks, totalCount };
}

export function useTaskMutations(onError?: (error: Error) => void, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  function syncTask(task: Task) {
    queryClient.setQueriesData<{ pages: Page<Task>[] }>({ queryKey: ["tasks"] }, (current) => {
      if (!current) return current;
      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          content: page.content.map((item) => (item.id === task.id ? task : item))
        }))
      };
    });
    queryClient.setQueryData(["task-detail", task.id], task);
  }

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["task-detail"] });
    onSuccess?.();
  }

  const createTask = useMutation({
    mutationFn: api.createTask,
    onSuccess: refresh,
    onError
  });

  const updateTask = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskRequest }) => api.updateTask(id, payload),
    onSuccess: (task) => {
      syncTask(task);
      refresh();
    },
    onError
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskRequest }) => api.updateTask(id, payload),
    onSuccess: (task) => {
      syncTask(task);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-detail"] });
    },
    onError
  });

  const deleteTask = useMutation({
    mutationFn: api.deleteTask,
    onSuccess: refresh,
    onError
  });

  function changeStatus(task: Task, status: TaskStatus) {
    if (task.status === status) return;
    updateStatus.mutate({
      id: task.id,
      payload: { title: task.title, status, duedate: task.duedate }
    });
  }

  return {
    createTask,
    updateTask,
    deleteTask,
    changeStatus,
    isSaving: createTask.isPending || updateTask.isPending || updateStatus.isPending || deleteTask.isPending
  };
}
