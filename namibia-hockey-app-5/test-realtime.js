// Test script to verify real-time updates
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your Supabase URL
const supabaseKey = 'YOUR_SUPABASE_KEY'; // Replace with your Supabase key
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to create a test news article
async function createTestArticle() {
  console.log('Creating test news article...');
  
  const testArticle = {
    title: 'Test Real-time Article ' + new Date().toISOString(),
    snippet: 'This is a test article to verify real-time updates',
    content: 'This article was created to test the real-time subscription functionality.',
    image_url: 'https://via.placeholder.com/800x450',
    author: 'Test User',
    author_title: 'Tester',
    read_time: '1 min',
    is_featured: false,
    category_id: 'YOUR_CATEGORY_ID', // Replace with a valid category ID
    user_id: 'YOUR_USER_ID', // Replace with a valid user ID
  };
  
  const { data, error } = await supabase
    .from('news_articles')
    .insert(testArticle)
    .select();
    
  if (error) {
    console.error('Error creating test article:', error);
    return null;
  }
  
  console.log('Test article created successfully:', data);
  return data[0];
}

// Function to delete a test article
async function deleteTestArticle(articleId) {
  console.log(`Deleting test article with ID: ${articleId}...`);
  
  const { error } = await supabase
    .from('news_articles')
    .delete()
    .eq('id', articleId);
    
  if (error) {
    console.error('Error deleting test article:', error);
    return false;
  }
  
  console.log('Test article deleted successfully');
  return true;
}

// Main test function
async function runTest() {
  console.log('Starting real-time update test...');
  
  // Create a test article
  const article = await createTestArticle();
  if (!article) {
    console.log('Test failed: Could not create test article');
    return;
  }
  
  // Wait for 10 seconds to observe real-time updates in the app
  console.log('Waiting for 10 seconds to observe real-time updates...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Delete the test article
  const deleted = await deleteTestArticle(article.id);
  if (!deleted) {
    console.log('Test failed: Could not delete test article');
    return;
  }
  
  console.log('Test completed successfully!');
}

// Run the test
runTest().catch(console.error);
