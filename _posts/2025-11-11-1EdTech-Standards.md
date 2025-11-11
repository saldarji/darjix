---
layout: post
title: "1EdTech Standards"
date: 2025-11-11
author: "Sal Darji"
---

1EdTech (formerly IMS Global Learning Consortium) develops technical standards that enable interoperability between educational technology systems. These standards ensure that different platforms—learning management systems, content publishers, assessment tools, and student information systems—can communicate and share data seamlessly. This interoperability is crucial for institutions that use multiple edtech tools, as it eliminates data silos and reduces manual workarounds.

Below is a quick reference guide to the key 1EdTech standards, organized by their primary function and data flow patterns.

{% include inset.html 
   content="<table>
  <thead>
    <tr>
      <th>Standard</th>
      <th>Category</th>
      <th>Layperson's Term</th>
      <th>Key Function</th>
      <th>Data Flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>EDU-API</strong></td>
      <td>Foundational</td>
      <td>Universal Language Framework 🧱</td>
      <td>Defines the secure, consistent structure for all data exchange APIs.</td>
      <td>Across all 1EdTech Standards</td>
    </tr>
    <tr>
      <td><strong>Common Cartridge</strong></td>
      <td>Content Packaging</td>
      <td>Digital Course Box 📦</td>
      <td>Packages an entire course's structure and content for portability.</td>
      <td>Publisher → LMS</td>
    </tr>
    <tr>
      <td><strong>LTI 1.3 / Advantage</strong></td>
      <td>Real-time Connection</td>
      <td>Secure Launch Button 🔗</td>
      <td>Securely launches external tools and returns grades immediately.</td>
      <td>LMS ↔ External Tool</td>
    </tr>
    <tr>
      <td><strong>QTI</strong></td>
      <td>Assessment Format</td>
      <td>Quiz Blueprint 📝</td>
      <td>Ensures assessments and questions are portable and consistently scored.</td>
      <td>Content Bank ↔ LMS</td>
    </tr>
    <tr>
      <td><strong>Caliper Analytics</strong></td>
      <td>Usage Tracking</td>
      <td>Data Sensor Language 📊</td>
      <td>Collects granular, standardized student activity data (time on task, clickstream).</td>
      <td>User Activity → Data Warehouse</td>
    </tr>
    <tr>
      <td><strong>CASE</strong></td>
      <td>Alignment</td>
      <td>Objective Identifier 🎯</td>
      <td>Provides unique IDs for skills and objectives to tag content and performance data.</td>
      <td>State/District → All Systems</td>
    </tr>
    <tr>
      <td><strong>Open Badges</strong></td>
      <td>Credentialing</td>
      <td>Digital Mini-Certificate 🏅</td>
      <td>Issues verifiable, digital credentials based on demonstrated skills.</td>
      <td>LMS/Tool → Learner</td>
    </tr>
    <tr>
      <td><strong>OneRoster</strong></td>
      <td>Administrative Data</td>
      <td>Administrator's Bridge 👥</td>
      <td>Automatically syncs student, teacher, class, and grade data across systems.</td>
      <td>SIS ↔ LMS/Applications</td>
    </tr>
  </tbody>
</table>" 
   caption="Overview of key 1EdTech standards showing their categories, simplified descriptions, functions, and data flow patterns." 
%}

