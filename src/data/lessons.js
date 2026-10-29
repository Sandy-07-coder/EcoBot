"use strict";

/**
 * Pre-defined lessons about e-waste awareness
 */

const LESSONS = {
  what_is_ewaste: {
    id: "what_is_ewaste",
    title: "What is E-Waste?",
    topic: "basics",
    difficulty: "beginner",
    content: `E-waste stands for electronic waste. It includes any electronic device you throw away - from mobile phones and laptops to TVs and refrigerators.

Every year, millions of tons of e-waste are generated worldwide. India alone produces over 3 million tons!

Why does it matter? These devices contain valuable materials like gold, silver, and copper. But they also have toxic substances like lead and mercury that harm our environment if not handled properly.

Key takeaway: E-waste is valuable but dangerous. Proper handling protects both the environment and recovers precious resources.`,
  },

  environmental_impact: {
    id: "environmental_impact",
    title: "Environmental Impact of E-Waste",
    topic: "environmental_impact",
    difficulty: "beginner",
    content: `When e-waste ends up in landfills, toxic chemicals leak into soil and water. Lead damages the nervous system. Mercury harms the brain and kidneys. Cadmium causes lung and bone damage.

These toxins enter our food chain through plants and animals. They can stay in the environment for decades.

Example: A single mobile phone battery thrown in regular trash can contaminate 600,000 liters of water!

But here's the good news: Proper recycling prevents 90% of this pollution. When you recycle responsibly, you protect your community's health.

Key takeaway: Improper e-waste disposal creates lasting environmental and health damage. Responsible recycling is essential.`,
  },

  battery_safety: {
    id: "battery_safety",
    title: "Safe Handling of Batteries",
    topic: "battery_disposal",
    difficulty: "intermediate",
    content: `Batteries power our devices but need special care. Lithium-ion batteries (in phones and laptops) can catch fire if damaged or heated.

Never:
- Throw batteries in regular trash
- Expose them to heat or fire
- Damage or puncture them
- Store damaged batteries at home

Always:
- Keep batteries cool and dry
- Take old batteries to collection points
- Remove batteries before recycling devices (if removable)
- Tape battery terminals to prevent short circuits

Example: A damaged laptop battery left in the sun can explode. But when recycled properly, its materials are safely recovered.

Key takeaway: Batteries are hazardous but valuable. Handle with care and always use proper collection points.`,
  },

  mobile_recycling: {
    id: "mobile_recycling",
    title: "Mobile Phone Recycling",
    topic: "disposal_habits",
    difficulty: "beginner",
    content: `Your old phone is a treasure chest! It contains gold, silver, copper, and rare earth elements worth recovering.

Before recycling:
1. Backup your data to cloud or computer
2. Remove SIM and memory cards
3. Factory reset to delete all personal data
4. Remove phone case and accessories

What happens during recycling? The phone is dismantled, and materials are separated. Circuit boards are processed to extract precious metals. Plastics are recycled. Nothing goes to waste!

Example: Recycling 1 million phones recovers 35,000 pounds of copper, 772 pounds of silver, 75 pounds of gold, and 33 pounds of palladium.

Key takeaway: Your old phone has value. Prepare it properly and recycle it responsibly.`,
  },

  repair_reuse: {
    id: "repair_reuse",
    title: "Repair, Reuse, and Recycle",
    topic: "repair_reuse",
    difficulty: "intermediate",
    content: `Before recycling, ask: Can it be repaired? Can someone else use it?

The 3 R's hierarchy:
1. REPAIR: Fix broken devices. Extends life by years.
2. REUSE: Donate or sell working devices. Helps others and reduces waste.
3. RECYCLE: Only when repair and reuse aren't possible.

Benefits of repair:
- Saves money
- Reduces waste
- Conserves resources
- Keeps devices out of landfills

Example: Repairing a cracked phone screen costs ₹2,000 but saves ₹20,000 on a new phone and prevents e-waste.

Many cities have repair cafes and authorized service centers. India's Right to Repair movement is making repairs easier!

Key takeaway: Repair first, reuse second, recycle last. Each step saves resources and money.`,
  },

  data_privacy: {
    id: "data_privacy",
    title: "Data Privacy Before Recycling",
    topic: "data_security",
    difficulty: "intermediate",
    content: `Your devices store personal information - photos, contacts, passwords, banking apps, emails. Before recycling, this data MUST be completely erased.

Steps to protect your data:
1. Backup important files
2. Sign out of all accounts (Google, Apple, social media)
3. Remove SIM and SD cards
4. Perform factory reset (Settings → Reset)
5. Remove device from cloud accounts
6. If possible, encrypt and wipe storage

Warning: Just deleting files isn't enough. Factory reset overwrites the storage, making data recovery nearly impossible.

Example: A journalist in Delhi donated an old phone without resetting it. His contacts and photos were recovered by someone else!

Key takeaway: Always factory reset before recycling. Your privacy depends on it.`,
  },

  accessories_recycling: {
    id: "accessories_recycling",
    title: "Recycling Electronic Accessories",
    topic: "identification",
    difficulty: "beginner",
    content: `E-waste isn't just phones and computers. Accessories also need proper disposal!

Include these:
- Chargers and cables
- Headphones and earbuds
- Computer mice and keyboards
- USB drives and memory cards
- Remote controls
- Power adapters

These contain copper, plastic, and sometimes small batteries. Don't throw them in regular trash!

Many collection centers accept accessories. Some electronics stores have drop-off boxes for cables and chargers.

Example: One Indian startup collects old cables and recycles the copper. From 1000 cables, they recover 20 kg of pure copper!

Key takeaway: Small accessories are e-waste too. Collect them and recycle together with devices.`,
  },
};

/**
 * Get lesson by ID
 */
function getLessonById(lessonId) {
  return LESSONS[lessonId];
}

/**
 * Get lessons by topic
 */
function getLessonsByTopic(topic) {
  return Object.values(LESSONS).filter((lesson) => lesson.topic === topic);
}

/**
 * Get lesson recommendations for user
 */
function getRecommendedLessons(userProfile) {
  const completed = userProfile.lessonsCompleted || [];
  const weakTopics = userProfile.weakTopics || [];
  const awarenessLevel = userProfile.awarenessLevel || "beginner";

  // Filter out completed lessons
  let available = Object.values(LESSONS).filter(
    (lesson) => !completed.includes(lesson.id)
  );

  // Prioritize weak topics
  if (weakTopics.length > 0) {
    const topicLessons = available.filter((lesson) =>
      weakTopics.includes(lesson.topic)
    );
    if (topicLessons.length > 0) {
      return topicLessons.slice(0, 3);
    }
  }

  // Filter by difficulty
  available = available.filter(
    (lesson) =>
      lesson.difficulty === awarenessLevel ||
      (awarenessLevel === "intermediate" && lesson.difficulty === "beginner") ||
      awarenessLevel === "advanced"
  );

  return available.slice(0, 3);
}

/**
 * Get all lesson topics
 */
function getAllTopics() {
  const topics = new Set();
  Object.values(LESSONS).forEach((lesson) => topics.add(lesson.topic));
  return Array.from(topics);
}

module.exports = {
  LESSONS,
  getLessonById,
  getLessonsByTopic,
  getRecommendedLessons,
  getAllTopics,
};
