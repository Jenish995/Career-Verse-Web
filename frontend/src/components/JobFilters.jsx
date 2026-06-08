import React from 'react';

const FILTER_GROUPS = [
  {
    id: 'jobType',
    label: 'Job Type',
    options: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship']
  },
  {
    id: 'experience',
    label: 'Experience Level',
    options: ['Entry Level', 'Mid Level', 'Senior Level', 'Director']
  },
  {
    id: 'category',
    label: 'Department',
    options: ['Software Development', 'UI/UX Design', 'Marketing', 'Data Science', 'Finance']
  }
];

const JobFilters = ({ selectedFilters, setSelectedFilters }) => {
  const handleCheckboxChange = (groupId, option) => {
    setSelectedFilters(prev => {
      const currentGroup = prev[groupId];
      const newGroup = currentGroup.includes(option)
        ? currentGroup.filter(item => item !== option)
        : [...currentGroup, option];
      
      return { ...prev, [groupId]: newGroup };
    });
  };

  return (
    <div className="filter-sidebar-content">
      <div className="filter-header-row">
        <h3>Filters</h3>
        <button onClick={() => setSelectedFilters({ jobType: [], experience: [], category: [] })} className="text-btn">Clear All</button>
      </div>

      {FILTER_GROUPS.map(group => (
        <div key={group.id} className="filter-group">
          <h4>{group.label}</h4>
          <div className="filter-options">
            {group.options.map(option => (
              <label key={option} className="filter-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={selectedFilters[group.id].includes(option)}
                  onChange={() => handleCheckboxChange(group.id, option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobFilters;