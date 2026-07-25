export async function loadLearningPaths(){
  const response=await fetch('./data/learning-paths.json',{cache:'no-cache'});
  if(!response.ok)throw new Error(`Unable to load learning paths (${response.status}).`);
  return response.json();
}
