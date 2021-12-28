#ifndef JGRAPH_H 
#define JGRAPH_H

#include <vector>
#include <string>

using namespace std;

class JGraph {
public:
	JGraph();
	struct ColumnMember {
		double Jvalues;
		double shiftedJvalues;
		bool hasPartnerIndex; // false when has no assigned partner
		size_t partnerIndex;
	};
	class Column {
		public:
 		void sortJ();
		double chemicalShift;
		double shiftedChemicalShift;
		string label;
		vector <ColumnMember> columnMembers;
	};
	bool hasJ(size_t first, size_t second, double &currentJ, double &currentShiftedJ); 
	void sortColumnByChemicalShift();
	void addColumn(double chemicalShift, const vector < double > &Jvalues, string aString = "no label");
	bool addAssignedCoupling(string label1, string label2, double valueJ);
	void setAssignedCoupling(int index1, int index2, double valueJ);
	void updateShiftedPositions();
	void sortJ(size_t index);
	void setShiftedJ(size_t first, size_t second, double currentShiftedJ);

	size_t getSize() const {return fColumns.size();};
public:
	vector <Column> fColumns;
	const double fDeltaDotAbove = 0.0;
	const double fDeltaDotBelow = fDeltaDotAbove;
	const double fDeltaLineAbove = 0.1;
	const double fDeltaLineBelow = fDeltaLineAbove;
};

#endif // JGRAPH_H
