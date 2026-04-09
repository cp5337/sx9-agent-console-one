import { supabase } from '../lib/supabase';
import { Playbook, ChainStep } from '../types/talon';

export async function fetchPlaybooks(): Promise<Playbook[]> {
  const { data, error } = await supabase
    .from('playbooks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Playbook[];
}

export async function createPlaybook(
  name: string,
  description: string,
  steps: ChainStep[],
  tags: string[]
): Promise<Playbook> {
  const { data, error } = await supabase
    .from('playbooks')
    .insert({ name, description, steps, tags })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Playbook;
}

export async function updatePlaybook(
  id: string,
  patch: Partial<Pick<Playbook, 'name' | 'description' | 'steps' | 'tags'>>
): Promise<Playbook> {
  const { data, error } = await supabase
    .from('playbooks')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Playbook;
}

export async function deletePlaybook(id: string): Promise<void> {
  const { error } = await supabase.from('playbooks').delete().eq('id', id);
  if (error) throw error;
}

export async function recordPlaybookRun(id: string): Promise<void> {
  const { data: current } = await supabase
    .from('playbooks')
    .select('run_count')
    .eq('id', id)
    .maybeSingle();

  await supabase
    .from('playbooks')
    .update({
      run_count: ((current?.run_count ?? 0) as number) + 1,
      last_run_at: new Date().toISOString(),
    })
    .eq('id', id);
}
