export const usernameGenerator = (fullName: string): string => {
  if (!fullName || !fullName.trim()) {
    throw new Error('Full name must be a non-empty string');
  }

  // Normalize: lowercase, remove non-letter/spaces, trim extra spaces
  const cleanName = fullName
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const nameParts = cleanName.split(' ');

  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  // Prepare username options based on availability of parts
  const usernameOptions = [];

  if (firstName) usernameOptions.push(firstName);
  if (firstName && lastName) {
    usernameOptions.push(firstName + lastName);
    usernameOptions.push(firstName + lastName.charAt(0));
    usernameOptions.push(firstName.charAt(0) + lastName);
  }

  // If no lastName, fallback to firstName only or generic
  if (usernameOptions.length === 0 && firstName) {
    usernameOptions.push(firstName);
  }
  if (usernameOptions.length === 0) {
    usernameOptions.push('user');
  }

  // Pick a random base username
  const selectedBase =
    usernameOptions[Math.floor(Math.random() * usernameOptions.length)];

  // Append a random 3-digit number
  const randomNum = Math.floor(Math.random() * 900) + 100;

  return `${selectedBase}${randomNum}`;
};
