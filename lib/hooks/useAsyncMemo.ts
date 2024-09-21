import { useState, useEffect, DependencyList } from "react";

type AsyncFunction<T> = () => Promise<T>;

export function useAsyncMemo<T>(
  asyncFunction: AsyncFunction<T>,
  deps: DependencyList,
  initialValue: T
): [T, boolean, Error | null] {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFunction();
        if (!isMounted) return;
        setValue(result);
      } catch (error: any) {
        if (!isMounted) return;
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, deps);

  return [value, loading, error];
}
