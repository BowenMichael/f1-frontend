import { render, screen, fireEvent } from '../../test-utils';
import { PatchNotesButton } from './PatchNotesButton';

describe('PatchNotesButton and PatchNotesDrawer', () => {
  it("renders the button with What's New label and latest version", () => {
    render(<PatchNotesButton />);

    const button = screen.getByRole('button', { name: /Open Patch Notes/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/What's New/i);
    expect(button).toHaveTextContent(/v1\.2\.0/i);
  });

  it('opens the drawer when clicked and displays version history', () => {
    render(<PatchNotesButton />);

    const button = screen.getByRole('button', { name: /Open Patch Notes/i });
    fireEvent.click(button);

    expect(screen.getByText('Patch Notes & Updates')).toBeInTheDocument();
    expect(screen.getByText('Current Version')).toBeInTheDocument();
    expect(screen.getByText('v1.1.0')).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });
});
