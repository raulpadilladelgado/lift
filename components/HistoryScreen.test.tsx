import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { HistoryScreen } from './HistoryScreen';
import { Exercise } from '../types';
import { t } from '../utils/translations';

describe('HistoryScreen', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });
  const exercises: Exercise[] = [
    {
      id: '1',
      name: 'Alpha',
      muscleGroup: 'Pecho',
      logs: [{ date: '2026-02-01', weight: 50, reps: 10 }],
    },
    {
      id: '2',
      name: 'Beta',
      muscleGroup: 'Espalda',
      logs: [],
    },
  ];

  it('renders exercises sorted by name', () => {
    render(<HistoryScreen exercises={exercises} onUpdateLog={vi.fn()} onDeleteLog={vi.fn()} />);
    const items = screen.getAllByTestId('history-exercise-item');
    expect(items[0].textContent).toContain('Alpha');
    expect(items[1].textContent).toContain('Beta');
  });

  it('updates a log entry from the modal', async () => {
    const onUpdateLog = vi.fn();
    render(<HistoryScreen exercises={exercises} onUpdateLog={onUpdateLog} onDeleteLog={vi.fn()} />);

    fireEvent.click(screen.getAllByTestId('history-exercise-item')[0]);
    const weightInput = await screen.findByLabelText(t.labels.weightShort);
    fireEvent.change(weightInput, { target: { value: '55' } });

    fireEvent.click(screen.getByRole('button', { name: t.actions.save }));

    await waitFor(() => {
      expect(onUpdateLog).toHaveBeenCalledWith('1', '2026-02-01', {
        date: '2026-02-01',
        weight: 55,
        reps: 10,
      });
    });
  });

  it('deletes a log entry with confirmation', async () => {
    const onDeleteLog = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<HistoryScreen exercises={exercises} onUpdateLog={vi.fn()} onDeleteLog={onDeleteLog} />);
    fireEvent.click(screen.getAllByTestId('history-exercise-item')[0]);
    const deleteButton = await screen.findByRole('button', { name: t.actions.delete });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(onDeleteLog).toHaveBeenCalledWith('1', '2026-02-01');
    });
  });
});
