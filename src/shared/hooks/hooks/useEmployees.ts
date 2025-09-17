import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Employee } from '@/lib/mockData';

export interface SupabaseEmployee {
  id: string;
  company_id: string;
  name: string;
  language: string;
  notes: string;
  created_at: string;
}

export const useEmployees = (companyId: string | null) => {
  const [employees, setEmployees] = useState<SupabaseEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees from Supabase
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!supabase) {
        setError('Supabase client is not initialized');
        setLoading(false);
        return;
      }

      if (!companyId) {
        setError('Company ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('company_id', companyId);
        
        if (error) {
          setError(error.message);
        } else {
          setEmployees(data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [companyId]);

  // Add a new employee
  const addEmployee = async (employee: Omit<SupabaseEmployee, 'id' | 'created_at'>) => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    if (!companyId) {
      throw new Error('Company ID is required');
    }

    const { data, error } = await supabase
      .from('employees')
      .insert([{...employee, company_id: companyId}])
      .select();
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (data) {
      setEmployees([...employees, ...data]);
    }
    
    return data;
  };

  // Update an existing employee
  const updateEmployee = async (id: string, updates: Partial<SupabaseEmployee>) => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .eq('company_id', companyId)
      .select();
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (data) {
      setEmployees(employees.map(emp => emp.id === id ? { ...emp, ...data[0] } : emp));
    }
    
    return data;
  };

  // Delete an employee
  const deleteEmployee = async (id: string) => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  return {
    employees,
    loading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee
  };
};