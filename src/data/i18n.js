export const LANGUAGES = { en: 'English', as: 'অসমীয়া' };

const messages = {
  en: {
    'nav.home': 'Home',
    'nav.play': 'Play',
    'nav.check-in': 'Check-in',
    'nav.anchors': 'Memory',
    'nav.caregiver': 'Caregiver',
    'actions.play': 'Play',
    'actions.close': 'Close',
    'actions.next': 'Next',
    'actions.repeat': 'Repeat',
    'actions.tryAgain': 'Try again',
    'actions.save': 'Save',
    'actions.back': 'Back to library',
    'app.localOnly': 'Saved locally on this device',
    'consent.eyebrow': 'Welcome to Apon Mon',
    'consent.title': 'Your memories. Your device. Your choice.',
    'consent.local': 'Your information stays on this device unless you choose to export it.',
    'consent.medical': 'This prototype supports wellbeing and screening. It does not diagnose dementia.',
    'consent.accept': 'Accept & Continue',
    'library.eyebrow': '26 gentle activities',
    'library.title': 'Cognitive Game Library',
    'library.subtitle': 'Choose by current stage or explore every activity.',
    'library.search': 'Search games',
    'library.together': 'Play together',
    'checkin.title': 'Daily Check-in',
    'anchors.title': 'Memory Anchors',
    'caregiver.title': 'Caregiver & ASHA Dashboard',
    'feedback.welcome': 'Wonderful work, {name}!',
    'feedback.team': 'Wonderful teamwork, {name}!',
    'feedback.retry': 'Good try. Take another look.',
    'game.card-match.name': 'Card Match / Memory Flip',
    'game.card-match.instructions': 'Turn over two cards and find every matching pair.',
    'game.sequence-repeat.name': 'Sequence Repeat',
    'game.sequence-repeat.instructions': 'Watch the pattern, then tap the same symbols in order.',
    'game.color-tap.name': 'Color Tap',
    'game.color-tap.instructions': 'Tap the colour named on the screen.'
  },
  as: {
    'nav.home': 'মুখ্যপৃষ্ঠা',
    'nav.play': 'খেলক',
    'nav.check-in': 'দৈনিক খবৰ',
    'nav.anchors': 'স্মৃতি',
    'nav.caregiver': 'যত্ন সহায়ক',
    'actions.play': 'খেলক',
    'actions.close': 'বন্ধ কৰক',
    'actions.next': 'পৰৱৰ্তী',
    'actions.repeat': 'পুনৰ কৰক',
    'actions.tryAgain': 'পুনৰ চেষ্টা কৰক',
    'actions.save': 'সংৰক্ষণ কৰক',
    'actions.back': 'খেলৰ তালিকালৈ যাওক',
    'consent.eyebrow': 'আপোন মনে আপোনাক স্বাগতম জনাইছে',
    'consent.title': 'আপোনাৰ স্মৃতি। আপোনাৰ ডিভাইচ। আপোনাৰ পছন্দ।',
    'consent.local': 'আপুনি নিজে বাহিৰলৈ নিদিয়ালৈকে আপোনাৰ তথ্য এই ডিভাইচতেই থাকে।',
    'consent.medical': 'এই নমুনাই সুস্থতা আৰু পৰীক্ষণত সহায় কৰে। ই ডিমেনচিয়া নিৰ্ণয় নকৰে।',
    'consent.accept': 'গ্ৰহণ কৰি আগবাঢ়ক',
    'library.eyebrow': '২৬টা সহজ কাৰ্যকলাপ',
    'library.title': 'মনৰ খেলৰ ভঁৰাল',
    'library.subtitle': 'বৰ্তমানৰ স্তৰ অনুসৰি বাছক বা সকলো খেল চাওক।',
    'library.search': 'খেল বিচাৰক',
    'library.together': 'একেলগে খেলক',
    'checkin.title': 'দৈনিক খবৰ',
    'anchors.title': 'স্মৃতিৰ সহায়',
    'caregiver.title': 'যত্ন সহায়কৰ ডেশ্বব’ৰ্ড',
    'feedback.welcome': 'বৰ ভাল, {name}!',
    'feedback.team': 'একেলগে বৰ ভাল কৰিলে, {name}!',
    'feedback.retry': 'ভাল চেষ্টা। আকৌ এবাৰ চাওক।',
    'game.card-match.name': 'কাৰ্ড মিলাওক',
    'game.card-match.instructions': 'দুখনকৈ কাৰ্ড খুলি মিল থকা যোৰ বিচাৰক।',
    'game.sequence-repeat.name': 'ক্ৰম পুনৰাবৃত্তি',
    'game.sequence-repeat.instructions': 'ক্ৰমটো চাওক, তাৰ পিছত একে ক্ৰমত চিহ্নবোৰ স্পৰ্শ কৰক।',
    'game.color-tap.name': 'ৰং স্পৰ্শ কৰক',
    'game.color-tap.instructions': 'পৰ্দাত কোৱা ৰংটো স্পৰ্শ কৰক।'
  }
};

export function t(language, key, params = {}) {
  const template = messages[language]?.[key] ?? messages.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}

export function gameName(language, game) {
  return t(language, `game.${game.id}.name`) === `game.${game.id}.name` ? game.name : t(language, `game.${game.id}.name`);
}

export function gameInstructions(language, game) {
  const key = `game.${game.id}.instructions`;
  return t(language, key) === key ? game.instructions : t(language, key);
}
