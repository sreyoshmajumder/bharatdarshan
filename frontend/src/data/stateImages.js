/**
 * STATE HERO IMAGES — BharatDarshan
 *
 * Strategy: query our own /api/wiki/<landmark> endpoint with a famous
 * place inside each state  Wikipedia returns a high-quality photo of
 * the landmark (not the state's flag/map which the state-name query often returns).
 *
 * Fallback chain: wikiQuery  →  directUrl  →  state.color gradient
 */

// Wikipedia article titles that reliably return iconic landscape photos
export const STATE_WIKI_QUERY = {
  'rajasthan':        'Amber Palace',
  'kerala':           'Alleppey',
  'maharashtra':      'Gateway of India',
  'goa':              'Palolem Beach',
  'uttar-pradesh':    'Taj Mahal',
  'himachal-pradesh': 'Rohtang Pass',
  'uttarakhand':      'Valley of Flowers National Park',
  'west-bengal':      'Victoria Memorial, Kolkata',
  'karnataka':        'Hampi',
  'tamil-nadu':       'Meenakshi Amman Temple',
  'andhra-pradesh':   'Visakhapatnam',
  'telangana':        'Charminar',
  'punjab':           'Golden Temple',
  'gujarat':          'Rann of Kutch',
  'assam':            'Kaziranga National Park',
  'odisha':           'Konark Sun Temple',
  'madhya-pradesh':   'Khajuraho',
  'jharkhand':        'Hundru Falls',
  'chhattisgarh':     'Chitrakote Falls',
  'haryana':          'Kurukshetra',
  'bihar':            'Mahabodhi Temple',
  'sikkim':           'Gurudongmar Lake',
  'arunachal-pradesh':'Tawang Monastery',
  'nagaland':         'Hornbill Festival',
  'manipur':          'Loktak Lake',
  'meghalaya':        'Nohkalikai Falls',
  'mizoram':          'Aizawl',
  'tripura':          'Ujjayanta Palace',
  'delhi':            'Red Fort',
  'jammu-kashmir':    'Dal Lake',
  'ladakh':           'Pangong lake',
  'andaman-nicobar':  'Radhanagar Beach',
  'lakshadweep':      'Bangaram Island',
  'puducherry':       'Pondicherry',
  'chandigarh':       'Rock Garden, Chandigarh',
};

// Pinned Wikimedia Commons / free-use images as direct fallback.
// These URLs are stable and CC-licensed.
export const STATE_DIRECT_IMAGES = {
  'rajasthan':        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Amber_fort_at_night.jpg/1280px-Amber_fort_at_night.jpg',
  'kerala':           'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Kerala_backwaters.jpg/1280px-Kerala_backwaters.jpg',
  'maharashtra':      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg/1280px-Mumbai_03-2016_30_Gateway_of_India.jpg',
  'goa':              'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Goa_beach.jpg/1280px-Goa_beach.jpg',
  'uttar-pradesh':    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1280px-Taj_Mahal_%28Edited%29.jpeg',
  'himachal-pradesh': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Rohtang_Pass_2016.jpg/1280px-Rohtang_Pass_2016.jpg',
  'uttarakhand':      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Valley_of_flowers.jpg/1280px-Valley_of_flowers.jpg',
  'west-bengal':      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Victoria_Memorial_Kolkata.jpg/1280px-Victoria_Memorial_Kolkata.jpg',
  'karnataka':        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Hampi_Vittala_temple03.jpg/1280px-Hampi_Vittala_temple03.jpg',
  'tamil-nadu':       'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Meenakshi_amman_temple4.jpg/800px-Meenakshi_amman_temple4.jpg',
  'punjab':           'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Golden_Temple_reflecting_pool.jpg/1280px-Golden_Temple_reflecting_pool.jpg',
  'gujarat':          'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Rann_of_Kutch.jpg/1280px-Rann_of_Kutch.jpg',
  'odisha':           'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Konarka_Temple.jpg/1280px-Konarka_Temple.jpg',
  'madhya-pradesh':   'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Khajuraho_Kandariya_Mahadewa_Temple_2013.jpg/1280px-Khajuraho_Kandariya_Mahadewa_Temple_2013.jpg',
  'telangana':        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Charminar_Hyderabad.jpg/800px-Charminar_Hyderabad.jpg',
  'delhi':            'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Red_Fort_in_Delhi_03-2016_d.jpg/1280px-Red_Fort_in_Delhi_03-2016_d.jpg',
  'jammu-kashmir':    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Dal_Lake_Shikaras.jpg/1280px-Dal_Lake_Shikaras.jpg',
  'ladakh':           'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Pangong_tso.jpg/1280px-Pangong_tso.jpg',
  'assam':            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/One-horned_rhino_kaziranga.jpg/1280px-One-horned_rhino_kaziranga.jpg',
  'sikkim':           'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Gurudongmar_Lake.jpg/1280px-Gurudongmar_Lake.jpg',
  'arunachal-pradesh':'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Tawang_Monastery_01.jpg/1280px-Tawang_Monastery_01.jpg',
  'meghalaya':        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Nohkalikai_falls.jpg/800px-Nohkalikai_falls.jpg',
  'bihar':            'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Mahabodhi_Temple_Bodhgaya.jpg/800px-Mahabodhi_Temple_Bodhgaya.jpg',
};

// Generic India backgrounds for non-state pages
export const INDIA_HERO_IMAGES = {
  // All-states page: Taj Mahal
  states:  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1280px-Taj_Mahal_%28Edited%29.jpeg',
  // Nearby / Heritage page: Konark Sun Temple (reliable URL)
  nearby:  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Konarka_Temple.jpg/1280px-Konarka_Temple.jpg',
  // Trip Planner page: Hampi
  planner: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Hampi_Vittala_temple03.jpg/1280px-Hampi_Vittala_temple03.jpg',
  // Login/Signup: Kerala backwaters
  auth:    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Kerala_backwaters.jpg/1280px-Kerala_backwaters.jpg',
};
