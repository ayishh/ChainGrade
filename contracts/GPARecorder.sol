// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title GPARecorder — on-chain student display name (set once) and per-semester GPA rows.
contract GPARecorder {
    
    struct Semester {
        uint256 year;
        uint256 semesterNumber;
        uint256 gpa; 
    }

    struct Student {
        string name;
        bool nameLocked;
        Semester[] records;
    }

    mapping(address => Student) private students;

    event NameSet(address indexed student, string name);
    event SemesterAdded(
        address indexed student,
        uint256 year,
        uint256 semesterNumber,
        uint256 gpa
    );

    // Set name once
    function setName(string calldata _name) external {
        Student storage student = students[msg.sender];
        require(!student.nameLocked, "Name is already fixed");
        require(bytes(_name).length > 0, "Name cannot be empty");

        student.name = _name;
        student.nameLocked = true;

        emit NameSet(msg.sender, _name);
    }

    // Add semester record
    function addSemester(
        uint256 year,
        uint256 semesterNumber,
        uint256 gpa
    ) external {
        
        require(gpa<= 400, "GPA must be between 0.00 and 4.00");
        require(year > 2000, "Invalid year");
        // require(semesterNumber > 0, "Invalid semester");
        require(semesterNumber >= 1 && semesterNumber <= 2, "Invalid semester");

        Student storage student = students[msg.sender];

        student.records.push(
            Semester(year, semesterNumber, gpa)
        );

        emit SemesterAdded(msg.sender, year, semesterNumber, gpa);
    }

    // Get student data
    function getStudent(
        address studentAddress
    )
        external
        view
        returns (
            string memory name,
            bool nameLocked,
            Semester[] memory records
        )
    {
        Student storage student = students[studentAddress];
        return (student.name, student.nameLocked, student.records);
    }
}