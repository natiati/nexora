import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../api/client';

// Carga una lista paginada de un recurso. `query` es el texto de búsqueda (opcional).
export function useList(api, { pageSize = 20, query = '' } = {}) {
  const [state, setState] = useState({ rows: [], total: 0, loading: true, error: '' });
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;

    api.list({ page, limit: pageSize, q: query || undefined })
      .then(({ data, total }) => {
        if (!active) return;
        // Si se eliminó el último registro de la página, se vuelve a la anterior
        if (data.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }
        setState({ rows: data, total, loading: false, error: '' });
      })
      .catch((err) => {
        if (active) setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(err) }));
      });

    return () => { active = false; };
  }, [api, page, pageSize, query, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { ...state, page, setPage, pageSize, reload };
}

// Opciones para un <select>: hasta 100 registros del recurso (el máximo de la API)
export function useOptions(api) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let active = true;
    api.list({ limit: 100 })
      .then(({ data }) => { if (active) setOptions(data); })
      .catch(() => { if (active) setOptions([]); });
    return () => { active = false; };
  }, [api]);

  return options;
}
