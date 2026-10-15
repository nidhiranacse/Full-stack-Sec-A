import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FeedbackForm from '../FeedbackForm';

describe('Practical A2: Feedback Form with Validation (React)', () => {
  it('renders all required elements with exact data-testid attributes', () => {
    render(<FeedbackForm />);

    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('rating-select')).toBeInTheDocument();
    expect(screen.getByTestId('comment-input')).toBeInTheDocument();
    expect(screen.getByTestId('comment-count')).toBeInTheDocument();
    expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
  });

  it('renders rating-select with an empty default option followed by options 1 to 5', () => {
    render(<FeedbackForm />);

    const select = screen.getByTestId('rating-select');
    const options = Array.from(select.querySelectorAll('option'));

    expect(options.length).toBe(6);
    expect(options[0].value).toBe('');
    expect(options[1].value).toBe('1');
    expect(options[2].value).toBe('2');
    expect(options[3].value).toBe('3');
    expect(options[4].value).toBe('4');
    expect(options[5].value).toBe('5');
  });

  it('renders comment counter in exact form {n}/200 and updates dynamically', () => {
    render(<FeedbackForm />);

    const counter = screen.getByTestId('comment-count');
    const commentInput = screen.getByTestId('comment-input');

    // Initial counter state: 0/200
    expect(counter).toHaveTextContent('0/200');

    // Type 15 characters
    fireEvent.change(commentInput, { target: { value: 'Great course work' } });
    expect(counter).toHaveTextContent(`${'Great course work'.length}/200`);

    // Clear comment
    fireEvent.change(commentInput, { target: { value: '' } });
    expect(counter).toHaveTextContent('0/200');
  });

  it('does NOT render error messages initially on clean load', () => {
    render(<FeedbackForm />);

    expect(screen.queryByTestId('name-error')).toBeNull();
    expect(screen.queryByTestId('email-error')).toBeNull();
    expect(screen.queryByTestId('rating-error')).toBeNull();
    expect(screen.queryByTestId('success-msg')).toBeNull();
  });

  it('renders name-error, email-error, and rating-error when submitting an empty form', () => {
    render(<FeedbackForm />);

    fireEvent.click(screen.getByTestId('submit-btn'));

    expect(screen.getByTestId('name-error')).toBeInTheDocument();
    expect(screen.getByTestId('email-error')).toBeInTheDocument();
    expect(screen.getByTestId('rating-error')).toBeInTheDocument();
    expect(screen.queryByTestId('success-msg')).toBeNull();
  });

  it('validates invalid email format and shows email-error', () => {
    render(<FeedbackForm />);

    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'notanemail' } });
    fireEvent.click(screen.getByTestId('submit-btn'));

    expect(screen.getByTestId('email-error')).toBeInTheDocument();
  });

  it('removes error messages individually as each field becomes valid', () => {
    render(<FeedbackForm />);

    // Trigger validation
    fireEvent.click(screen.getByTestId('submit-btn'));
    expect(screen.getByTestId('name-error')).toBeInTheDocument();
    expect(screen.getByTestId('email-error')).toBeInTheDocument();
    expect(screen.getByTestId('rating-error')).toBeInTheDocument();

    // Fix name
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Rahul Raj' } });
    expect(screen.queryByTestId('name-error')).toBeNull();
    expect(screen.getByTestId('email-error')).toBeInTheDocument();
    expect(screen.getByTestId('rating-error')).toBeInTheDocument();

    // Fix email
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'rahul@example.com' } });
    expect(screen.queryByTestId('name-error')).toBeNull();
    expect(screen.queryByTestId('email-error')).toBeNull();
    expect(screen.getByTestId('rating-error')).toBeInTheDocument();

    // Fix rating
    fireEvent.change(screen.getByTestId('rating-select'), { target: { value: '5' } });
    expect(screen.queryByTestId('name-error')).toBeNull();
    expect(screen.queryByTestId('email-error')).toBeNull();
    expect(screen.queryByTestId('rating-error')).toBeNull();
  });

  it('shows success message with exact text "Thank you, {name}! Feedback submitted." upon valid submission', () => {
    const handleSuccess = vi.fn();
    render(<FeedbackForm onSubmitSuccess={handleSuccess} />);

    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Rahul Raj' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'rahul@example.com' } });
    fireEvent.change(screen.getByTestId('rating-select'), { target: { value: '5' } });
    fireEvent.change(screen.getByTestId('comment-input'), { target: { value: 'Wonderful practical test!' } });

    fireEvent.click(screen.getByTestId('submit-btn'));

    const successMsg = screen.getByTestId('success-msg');
    expect(successMsg).toBeInTheDocument();
    expect(successMsg).toHaveTextContent('Thank you, Rahul Raj! Feedback submitted.');

    expect(screen.queryByTestId('name-error')).toBeNull();
    expect(screen.queryByTestId('email-error')).toBeNull();
    expect(screen.queryByTestId('rating-error')).toBeNull();

    expect(handleSuccess).toHaveBeenCalledWith({
      name: 'Rahul Raj',
      email: 'rahul@example.com',
      rating: 5,
      comment: 'Wonderful practical test!'
    });
  });
});
